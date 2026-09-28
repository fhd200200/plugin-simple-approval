import { defineCollection } from '@nocobase/database';

const actor = { type: 'belongsTo', target: 'users' } as any;
export const approvalTemplates = defineCollection({ name: 'approval_templates', title: 'Approval Templates', fields: [
 {type:'string',name:'name',allowNull:false,unique:true},{type:'text',name:'description'},{type:'string',name:'targetCollection',allowNull:false},
 {type:'boolean',name:'active',defaultValue:false},{type:'integer',name:'version',defaultValue:1},{type:'json',name:'statusMapping'},
 actor as any, {type:'hasMany',name:'steps',target:'approval_steps',foreignKey:'templateId'}
]});
export const approvalSteps = defineCollection({ name:'approval_steps', title:'Approval Steps', fields:[
 {type:'integer',name:'templateId',allowNull:false,index:true},{type:'string',name:'name',allowNull:false},{type:'integer',name:'stepOrder',allowNull:false},
 {type:'string',name:'approverType',allowNull:false},{type:'json',name:'approverConfig',allowNull:false},{type:'string',name:'mode',defaultValue:'sequential'},
 {type:'string',name:'completionRule',defaultValue:'all'},{type:'string',name:'returnMode',defaultValue:'submitter'},{type:'boolean',name:'active',defaultValue:true}
]});
export const approvalRequests = defineCollection({ name:'approval_requests', title:'Approval Requests', fields:[
 {type:'string',name:'requestNo',allowNull:false,unique:true,index:true},{type:'integer',name:'templateId',allowNull:false},{type:'integer',name:'templateVersion',allowNull:false},
 {type:'string',name:'targetCollection',allowNull:false},{type:'string',name:'targetRecordId',allowNull:false},{type:'integer',name:'submittedBy',allowNull:false},
 {type:'date',name:'submittedAt'},{type:'string',name:'status',defaultValue:'draft',index:true},{type:'integer',name:'currentStep'},{type:'json',name:'currentApprovers'},
 {type:'date',name:'completedAt'},{type:'text',name:'rejectionReason'},{type:'text',name:'returnReason'},{type:'integer',name:'version',defaultValue:0}
]});
export const approvalActions = defineCollection({ name:'approval_actions', title:'Approval Actions', fields:[
 {type:'integer',name:'requestId',allowNull:false,index:true},{type:'integer',name:'stepId'},{type:'integer',name:'actorId',allowNull:false},{type:'string',name:'action',allowNull:false},{type:'text',name:'comment'},{type:'date',name:'createdAt'}
]});
export const approvalSnapshots = defineCollection({ name:'approval_snapshots', title:'Approval Snapshots', fields:[{type:'integer',name:'requestId',unique:true},{type:'json',name:'snapshotData',allowNull:false},{type:'date',name:'createdAt'}]});
export default [approvalTemplates,approvalSteps,approvalRequests,approvalActions,approvalSnapshots];
