<template>
    <div>
        <div  class="oth-list-item">
            <div class="left">
                <div class="info">
                    <p class="user" v-if="authorId&&authorId.toLocaleLowerCase()==item.userId.toLocaleLowerCase()">作者</p>
                    <p class="user" v-else>{{item.username}} {{item.userId}}</p>
                    <p class="comment" v-html ="item.comment"></p>
                </div>
            </div>
            <div class="right">
              <template v-if="userId">
                <div @click="replay(item)" class="replay-btn">回复</div>
              </template>
							<div class="praise-btn" v-if="userId">
									<i aria-hidden="true" class="fa fa-thumbs-o-up" v-if="!item.approved" @click.self="praise(item)"></i>
									<i class="fa fa-thumbs-up" style="color:#4B77B0;" aria-hidden="true" v-else @click.self="praise(item)"></i>
									<template v-if="item.approve>0">
											<span>{{item.approve}}</span>
									</template>
							</div>
							<div class="praise-btn" v-else>
									<template v-if="item.approve>0">
										<span class="font">赞</span>
										<span>{{item.approve}}</span>
									</template>
							</div>
            </div>
        </div>
				<!-- <template  v-if="item.children&&item.children.length">
						<replay v-for="(it,i) of item.children"  
						:key="i" :item="it" 
						:list="item.children"
						:mainCommentUserId="mainCommentUserId" 
						:authorId="authorId" 
						:isAuthor="isAuthor" 
						:userId="userId"
            :parentItemList="item.children"
						@praise="praise(it)" @replay="replay(it)" />
				</template> -->
    </div>
</template>
<script>
export default {
	  name:"replay",
    props:["item","authorId","isAuthor","userId","parentItemList"],
    methods:{
        //点赞
        praise(it){
         this.$emit('praise',it)
				},
				//回复
				replay(it){
					this.$emit('replay',null,it,this.parentItemList)
				}
    }
}
</script>
<style scoped lang="stylus">
.oth-list-item{
    display:flex;
    justify-content:space-between;
    margin-top:10px;
    padding-left:10px;
    .left{
        display:flex;
				width:80%;
        .info{
					width:100%;
            .user{
                font-size:13px;
                color:#999;
                margin-bottom:2px;
            }
            .comment{
                font-size:14px;
                line-height:1.5;
                word-break: break-all;
                max-width: 100%;
                /deep/a{
                  color:blue;
                }
            }
            .replay-btn{
              color:#4b77b0;
              font-size:13px;
              white-space:nowrap;
              padding:5px 0;
            }
        }
    }
    .right{
      // float: right;
        flex-shrink:0;
        flex-grow:0;
        display:flex;
        .replay-btn{
          color:#4b77b0;
          font-size:13px;
          margin-right:10px;
          white-space:nowrap;
          flex-shrink:0;
          flex-grow:0;
        }
        .praise-btn{
          color: #999;
          i{
            margin-right:5px;
						font-size:16px;
          }
          flex-shrink:0;
          flex-grow:0;
					font-size:13px;
					.font{
						margin-right:5px;
					}
        }
      }
}
</style>