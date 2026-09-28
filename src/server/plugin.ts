import { Plugin } from '@nocobase/server';
import collections from './collections';
import { ApprovalEngine } from './services/approval-engine';

export default class PluginSimpleApprovalServer extends Plugin {
  engine!: ApprovalEngine;
  async beforeLoad(){ this.app.logger.info('[simple-approval] loading independent approval engine'); }
  async load(){
    const app:any=this.app;
    // Collections in src/server/collections are discovered by NocoBase's plugin loader.
    const repository:any={
      transaction: async (fn:any)=> app.db.transaction(fn),
      getRequest: async(id:number,tx?:any)=>app.db.getRepository('approval_requests',tx).findOne({filter:{id}}),
      getSteps: async(templateId:number,version:number,tx?:any)=>app.db.getRepository('approval_steps',tx).find({filter:{templateId,active:true},sort:['stepOrder']}),
      resolveApprovers: async(step:any)=> step.approverConfig?.userIds|| (step.approverConfig?.userId?[step.approverConfig.userId]:[]),
      updateRequest: async(id:number,patch:any,where?:any,tx?:any)=> id?app.db.getRepository('approval_requests',tx).update({filter:{id,...(where||{})},values:patch}).then((x:any)=>!!x):app.db.getRepository('approval_requests',tx).create({values:patch}),
      addAction:(data:any,tx?:any)=>app.db.getRepository('approval_actions',tx).create({values:data}),
      snapshot:(data:any,tx?:any)=>app.db.getRepository('approval_snapshots',tx).create({values:data}),
      nextRequestNo:async()=>{const n=Date.now();return `APR-${String(n).slice(-6).padStart(6,'0')}`;},
      notify:async()=>undefined,
    };
    this.engine=new ApprovalEngine(repository,app.logger);
    const rm:any=app.resourceManager;
    if(rm?.define){rm.define({name:'approval',actions:{submit:async(ctx:any)=>this.engine.submit(ctx.request.body),approve:async(ctx:any)=>this.engine.act(ctx.request.params.id,ctx.state.currentUser.id,'approved'),reject:async(ctx:any)=>this.engine.act(ctx.request.params.id,ctx.state.currentUser.id,'rejected',ctx.request.body.reason),return:async(ctx:any)=>this.engine.act(ctx.request.params.id,ctx.state.currentUser.id,'returned',ctx.request.body.reason),cancel:async(ctx:any)=>this.engine.act(ctx.request.params.id,ctx.state.currentUser.id,'cancelled')}});}
  }
}
