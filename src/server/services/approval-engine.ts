/**
 * Simple Approval Engine
 *
 * A self-contained, workflow-independent approval engine.
 * All persistence goes through the ApprovalRepository interface,
 * so the engine stays pure logic and easy to unit test.
 */

export type ApprovalStatus =
  | 'pending'
  | 'in_progress'
  | 'approved'
  | 'rejected'
  | 'returned'
  | 'cancelled';

export type ApprovalActionName = 'submitted' | 'approved' | 'rejected' | 'returned' | 'cancelled';

export interface ApprovalStep {
  id: number;
  name: string;
  stepOrder: number;
  approverType: 'user' | 'users' | 'role';
  approverConfig: any;
  mode: 'sequential' | 'parallel';
  completionRule: 'all' | 'any';
  active?: boolean;
}

export interface ApprovalRequest {
  id: number;
  requestNo: string;
  templateId: number;
  templateVersion: number;
  targetCollection: string;
  targetRecordId: string;
  submittedBy: number;
  status: ApprovalStatus;
  currentStep: number;
  currentApprovers: number[];
  version: number;
  [key: string]: any;
}

export interface ApprovalRepository {
  transaction<T>(fn: (tx: any) => Promise<T>): Promise<T>;
  getTemplate(id: number, tx?: any): Promise<any>;
  getSteps(templateId: number, tx?: any): Promise<ApprovalStep[]>;
  resolveApprovers(step: ApprovalStep, request: ApprovalRequest | null, tx?: any): Promise<number[]>;
  createRequest(values: any, tx?: any): Promise<ApprovalRequest>;
  getRequest(id: number, tx?: any): Promise<ApprovalRequest | null>;
  findOpenRequest(collection: string, recordId: string, tx?: any): Promise<ApprovalRequest | null>;
  updateRequest(id: number, patch: any, tx?: any): Promise<void>;
  addAction(data: any, tx?: any): Promise<void>;
  countStepApproverApprovals(requestId: number, stepId: number, tx?: any): Promise<number>;
  snapshot(requestId: number, data: any, tx?: any): Promise<void>;
  nextRequestNo(tx?: any): Promise<string>;
  updateTargetRecord(collection: string, recordId: string, values: any, tx?: any): Promise<void>;
}

export class ApprovalError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'ApprovalError';
    this.code = code;
  }
}

const OPEN_STATUSES: ApprovalStatus[] = ['pending', 'in_progress'];

export class ApprovalEngine {
  constructor(private repo: ApprovalRepository, private logger: any = console) {}

  /**
   * Create an approval request for a business record.
   * The first active step of the template is started immediately.
   */
  async submit(input: {
    template: any;
    steps: ApprovalStep[];
    targetCollection: string;
    targetRecordId: string;
    userId: number;
    snapshot?: any;
  }): Promise<ApprovalRequest> {
    return this.repo.transaction(async (tx) => {
      const open = await this.repo.findOpenRequest(input.targetCollection, input.targetRecordId, tx);
      if (open) {
        throw new ApprovalError(
          'OPEN_REQUEST',
          `An approval request (${open.requestNo}) is already in progress for this record.`,
        );
      }

      const steps = (input.steps || [])
        .filter((s) => s.active !== false)
        .sort((a, b) => a.stepOrder - b.stepOrder);
      if (!steps.length) {
        throw new ApprovalError('NO_STEPS', 'The approval template has no active steps.');
      }

      const first = steps[0];
      const approvers = await this.repo.resolveApprovers(first, null, tx);
      if (!approvers.length) {
        throw new ApprovalError(
          'NO_APPROVER',
          `No approver could be resolved for step "${first.name}". Check the step configuration.`,
        );
      }

      const requestNo = await this.repo.nextRequestNo(tx);
      const request = await this.repo.createRequest(
        {
          requestNo,
          templateId: input.template.id,
          templateVersion: input.template.version || 1,
          targetCollection: input.targetCollection,
          targetRecordId: String(input.targetRecordId),
          submittedBy: input.userId,
          submittedAt: new Date(),
          status: 'in_progress',
          currentStep: first.stepOrder,
          currentApprovers: approvers,
          version: 0,
        },
        tx,
      );

      await this.repo.snapshot(request.id, input.snapshot ?? null, tx);
      await this.repo.addAction(
        {
          requestId: request.id,
          stepId: first.id,
          actorId: input.userId,
          action: 'submitted',
          comment: `Submitted for approval (${requestNo})`,
        },
        tx,
      );
      await this.applyTargetStatus(
        input.template,
        input.targetCollection,
        input.targetRecordId,
        'submitted',
        tx,
      );

      this.logger?.info?.(`[simple-approval] request ${requestNo} created for ${input.targetCollection}#${input.targetRecordId}`);
      return request;
    });
  }

  /**
   * Perform an action on an existing request:
   * approve / reject / return (by a current-step approver)
   * or cancel (by the submitter or an administrator).
   */
  async act(input: {
    requestId: number;
    actorId: number;
    action: 'approved' | 'rejected' | 'returned' | 'cancelled';
    comment?: string;
    isAdmin?: boolean;
  }): Promise<ApprovalRequest> {
    return this.repo.transaction(async (tx) => {
      const r = await this.repo.getRequest(input.requestId, tx);
      if (!r) {
        throw new ApprovalError('NOT_FOUND', 'Approval request not found.');
      }
      if (!OPEN_STATUSES.includes(r.status)) {
        throw new ApprovalError(
          'PROCESSED',
          `This request has already been processed (${r.status}).`,
        );
      }
      const template = await this.repo.getTemplate(r.templateId, tx);

      // ---- cancel -------------------------------------------------------
      if (input.action === 'cancelled') {
        if (r.submittedBy !== input.actorId && !input.isAdmin) {
          throw new ApprovalError(
            'UNAUTHORIZED',
            'Only the submitter or an administrator can cancel this request.',
          );
        }
        await this.repo.updateRequest(
          r.id,
          { status: 'cancelled', completedAt: new Date(), version: r.version + 1, currentApprovers: [] },
          tx,
        );
        await this.repo.addAction(
          { requestId: r.id, stepId: null, actorId: input.actorId, action: 'cancelled', comment: input.comment },
          tx,
        );
        await this.applyTargetStatus(template, r.targetCollection, r.targetRecordId, 'cancelled', tx);
        return this.repo.getRequest(r.id, tx);
      }

      // ---- authorization ------------------------------------------------
      const approvers: number[] = Array.isArray(r.currentApprovers) ? r.currentApprovers : [];
      if (!approvers.includes(input.actorId)) {
        throw new ApprovalError(
          'UNAUTHORIZED',
          'You are not an approver for the current step of this request.',
        );
      }

      // ---- reject / return ----------------------------------------------
      if (input.action === 'rejected' || input.action === 'returned') {
        if (!(input.comment || '').trim()) {
          throw new ApprovalError('REASON_REQUIRED', 'A reason is required for this action.');
        }
        const patch: any = {
          status: input.action === 'rejected' ? 'rejected' : 'returned',
          completedAt: new Date(),
          version: r.version + 1,
          currentApprovers: [],
        };
        if (input.action === 'rejected') {
          patch.rejectionReason = input.comment;
        } else {
          patch.returnReason = input.comment;
        }
        await this.repo.updateRequest(r.id, patch, tx);
        await this.repo.addAction(
          { requestId: r.id, stepId: null, actorId: input.actorId, action: input.action, comment: input.comment },
          tx,
        );
        await this.applyTargetStatus(template, r.targetCollection, r.targetRecordId, input.action, tx);
        return this.repo.getRequest(r.id, tx);
      }

      // ---- approve --------------------------------------------------------
      const steps = (await this.repo.getSteps(r.templateId, tx))
        .filter((s) => s.active !== false)
        .sort((a, b) => a.stepOrder - b.stepOrder);
      const current = steps.find((s) => s.stepOrder === r.currentStep);
      if (!current) {
        throw new ApprovalError('STEP', 'The current approval step is no longer active.');
      }

      await this.repo.addAction(
        { requestId: r.id, stepId: current.id, actorId: input.actorId, action: 'approved', comment: input.comment },
        tx,
      );

      // For parallel steps with multiple approvers, wait until the
      // completion rule is satisfied.
      let stepComplete = true;
      if (approvers.length > 1 && current.completionRule !== 'any') {
        const distinctApproved = await this.repo.countStepApproverApprovals(r.id, current.id, tx);
        stepComplete = distinctApproved >= approvers.length;
      }
      if (!stepComplete) {
        // Waiting for the remaining approvers of this step.
        return this.repo.getRequest(r.id, tx);
      }

      const nextStep = steps.find((s) => s.stepOrder > current.stepOrder);
      if (!nextStep) {
        await this.repo.updateRequest(
          r.id,
          { status: 'approved', completedAt: new Date(), version: r.version + 1, currentApprovers: [] },
          tx,
        );
        await this.applyTargetStatus(template, r.targetCollection, r.targetRecordId, 'approved', tx);
        return this.repo.getRequest(r.id, tx);
      }

      const nextApprovers = await this.repo.resolveApprovers(nextStep, r, tx);
      if (!nextApprovers.length) {
        throw new ApprovalError(
          'NO_APPROVER',
          `No approver could be resolved for step "${nextStep.name}". Check the step configuration.`,
        );
      }
      await this.repo.updateRequest(
        r.id,
        {
          status: 'in_progress',
          currentStep: nextStep.stepOrder,
          currentApprovers: nextApprovers,
          version: r.version + 1,
        },
        tx,
      );
      return this.repo.getRequest(r.id, tx);
    });
  }

  /**
   * Optionally write a status value back onto the business record,
   * according to the template's statusField / statusMapping.
   */
  private async applyTargetStatus(
    template: any,
    collection: string,
    recordId: string,
    event: string,
    tx?: any,
  ): Promise<void> {
    try {
      const field = template?.statusField;
      const value = template?.statusMapping?.[event];
      if (field && value) {
        await this.repo.updateTargetRecord(collection, recordId, { [field]: value }, tx);
      }
    } catch (e: any) {
      // A failure to stamp the business record must not break the approval flow.
      this.logger?.warn?.(`[simple-approval] failed to update target record status: ${e?.message || e}`);
    }
  }
}
