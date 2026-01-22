首页判断是否更新代码

const systemInfo = uni.getSystemInfoSync();
const current = systemInfo.appWgtVersion;  // 获取app当前版本号
 
// 跳转到更新页面
if (res.code == 200 && res.data) {
    let obj = {
	    contents: data.latestVersion,
	    is_mandatory: true,
	    url: data.downloadUrl
    }
    uni.navigateTo({
	    url: '/pages/myPackage/pages/upgrade/index?obj='+encodeURIComponent(JSON.stringify(obj))        
    }
})
 


 index.vue 
 <template>
	<view class="upgrade-popup">
		<!-- <image class="header-bg" src="../../static/upgrade_bg.png" mode="widthFix"></image> -->
		<view class="main">
			<view class="version">发现新版本{{ versionName }}</view>
			<view class="content">
				<text class="title">更新内容</text>
				<view class="desc" v-html="versionDesc"></view>
			</view>
			<!--下载状态-进度条显示 -->
			<view class="footer" v-if="isStartDownload">
				<view class="progress-view" :class="{ 'active':!hasProgress }" @click="handleInstallApp">
					<!-- 进度条 -->
					<view v-if="hasProgress" style="height: 100%;">
						<view class="txt">{{ percentText }}</view>
						<view class="progress" :style="setProStyle"></view>
					</view>
					<view v-else>
						<view class="btn upgrade force">{{ isDownloadFinish ? '立即安装' : '下载中...' }}</view>
					</view>
				</view>
			</view>
			<!-- 强制更新 -->
			<view class="footer" v-else-if="isForceUpdate">
				<view class="btn upgrade force" @click="handleUpgrade">立即更新</view>
			</view>
			<!-- 可选择更新 -->
			<view class="footer" v-else>
				<view class="btn close" @click="handleClose">以后再说</view>
				<view class="btn upgrade" @click="handleUpgrade">立即更新</view>
			</view>
		</view>
	</view>
</template>
 
<script setup>
	import {
		ref,
		computed
	} from 'vue';
	import {
		downloadApp,
		installApp
	} from './upgrade.js';
	import {
		onLoad,
		onBackPress
	} from "@dcloudio/uni-app";
 
	// 响应式数据
	const isForceUpdate = ref(false); // 是否强制更新
	const versionName = ref(''); // 版本名称
	const versionDesc = ref(''); // 更新说明
	const downloadUrl = ref(''); // APP 下载链接
	const isDownloadFinish = ref(false); // 是否下载完成
	const hasProgress = ref(false); // 是否能显示进度条
	const currentPercent = ref(0); // 当前下载百分比
	const isStartDownload = ref(false); // 是否开始下载
	const fileName = ref(''); // 下载后 app 本地路径名称
 
	// 计算属性
	const setProStyle = computed(() => {
		return {
			width: (510 * currentPercent.value / 100) + 'rpx' // 510：按钮进度条宽度
		};
	});
 
	const percentText = computed(() => {
		let percent = currentPercent.value;
		if (typeof percent !== 'number' || isNaN(percent)) return '下载中...';
		if (percent < 100) return `下载中${percent}%`;
		return '立即安装';
	});
 
	// 生命周期钩子
	onLoad((option) => {
		const obj = JSON.parse(decodeURIComponent(option.obj));
		versionName.value = obj.contents; // 版本名称
		versionDesc.value = "修复若干bug"; // 更新说明
		downloadUrl.value = obj.url; // 下载链接
		isForceUpdate.value = true;
	});
 
	onBackPress((options) => {
		// 禁用返回
		if (options.from === 'backbutton') {
			return true;
		}
	});
 
	// 方法
	const handleUpgrade = () => {
		if (downloadUrl.value) {
			isStartDownload.value = true;
			// 开始下载 App
			downloadApp(downloadUrl.value, (current) => {
				// 下载进度监听
				hasProgress.value = true;
				currentPercent.value = current;
			}).then((newFileName) => {
				// 下载完成
				isDownloadFinish.value = true;
				fileName.value = newFileName;
				if (newFileName) {
					// 自动安装 App
					handleInstallApp();
				}
			}).catch((e) => {
				console.log(e, 'e');
			});
		} else {
			uni.showToast({
				title: '下载链接不存在',
				icon: 'none'
			});
		}
	};
 
	const handleInstallApp = () => {
		// 下载完成才能安装，防止下载过程中点击
		if (isDownloadFinish.value && fileName.value) {
			installApp(fileName.value, () => {
				// 安装成功,关闭升级弹窗
				uni.navigateBack();
			});
		}
	};
 
	const handleClose = () => {
		uni.navigateBack();
	};
</script>
 
<style>
	page {
		background: rgba(0, 0, 0, 0.5);
		/**设置窗口背景半透明*/
	}
</style>
 
<style lang="scss" scoped>
	.upgrade-popup {
		width: 580rpx;
		height: auto;
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: #fff;
		border-radius: 20rpx;
		box-sizing: border-box;
		border: 1px solid #eee;
	}
 
	.header-bg {
		width: 100%;
		margin-top: -112rpx;
	}
 
	.main {
		padding: 10rpx 30rpx 30rpx;
		box-sizing: border-box;
 
		.version {
			font-size: 36rpx;
			color: #026DF7;
			font-weight: 700;
			width: 100%;
			text-align: center;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			letter-spacing: 1px;
		}
 
		.content {
			margin-top: 60rpx;
 
			.title {
				font-size: 28rpx;
				font-weight: 700;
				color: #000000;
			}
 
			.desc {
				box-sizing: border-box;
				margin-top: 20rpx;
				font-size: 28rpx;
				color: #6A6A6A;
				max-height: 80vh;
				overflow-y: auto;
			}
		}
 
		.footer {
			width: 100%;
			display: flex;
			justify-content: center;
			align-items: center;
			position: relative;
			flex-shrink: 0;
			margin-top: 100rpx;
 
			.btn {
				width: 246rpx;
				display: flex;
				justify-content: center;
				align-items: center;
				position: relative;
				z-index: 999;
				height: 96rpx;
				box-sizing: border-box;
				font-size: 32rpx;
				border-radius: 10rpx;
				letter-spacing: 2rpx;
 
				&.force {
					width: 500rpx;
				}
 
				&.close {
					border: 1px solid #E0E0E0;
					margin-right: 25rpx;
					color: #000;
				}
 
				&.upgrade {
					background-color: #026DF7;
					color: white;
				}
			}
 
			.progress-view {
				width: 510rpx;
				height: 90rpx;
				display: flex;
				position: relative;
				align-items: center;
				border-radius: 6rpx;
				background-color: #dcdcdc;
				display: flex;
				justify-content: flex-start;
				padding: 0px;
				box-sizing: border-box;
				border: none;
				overflow: hidden;
 
				&.active {
					background-color: #026DF7;
				}
 
				.progress {
					height: 100%;
					background-color: #026DF7;
					padding: 0px;
					box-sizing: border-box;
					border: none;
					border-top-left-radius: 10rpx;
					border-bottom-left-radius: 10rpx;
				}
 
				.txt {
					font-size: 28rpx;
					position: absolute;
					top: 50%;
					left: 50%;
					transform: translate(-50%, -50%);
					color: #fff;
				}
			}
		}
	}
</style>


upgrade.js
/**
 * @description H5+下载App
 * @param downloadUrl:App下载链接
 * @param progressCallBack:下载进度回调
 */
export const downloadApp = (downloadUrl, progressCallBack = () => {}, ) => {
	return new Promise((resolve, reject) => {
		//创建下载任务
		const downloadTask = plus.downloader.createDownload(downloadUrl, {
			method: "GET"
		}, (task, status) => {
			console.log(status, 'status')
			if (status == 200) { //下载成功
				resolve(task.filename)
 
			} else {
				reject('fail')
				uni.showToast({
					title: '下载失败',
					duration: 1500,
					icon: "none"
				});
			}
		})
		//监听下载过程
		downloadTask.addEventListener("statechanged", (task, status) => {
			switch (task.state) {
				case 1: // 开始  
					break;
				case 2: //已连接到服务器  
					break;
				case 3: // 已接收到数据  
					let hasProgress = task.totalSize && task.totalSize > 0 //是否能获取到App大小
					if (hasProgress) {
						let current = parseInt(100 * task.downloadedSize / task
						.totalSize); //获取下载进度百分比
						progressCallBack(current)
					}
					break;
				case 4: // 下载完成       
					break;
			}
		});
		//开始执行下载
		downloadTask.start();
	})
 
 
}
/**
 * @description H5+安装APP
 * @param fileName:app文件名
 * @param callBack:安装成功回调
 */
export const installApp = (fileName, callBack = () => {}) => {
	//注册广播监听app安装情况
	onInstallListening(callBack);
	//开始安装
	plus.runtime.install(plus.io.convertLocalFileSystemURL(fileName), {}, () => {
		//成功跳转到安装界面
	}, function(error) {
		uni.showToast({
			title: '安装失败',
			duration: 1500,
			icon: "none"
		});
	})
 
}
/**
 * @description 注册广播监听APP是否安装成功
 * @param callBack:安装成功回调函数
 */
const onInstallListening = (callBack = () => {}) => {
 
	let mainActivity = plus.android.runtimeMainActivity(); //获取activity
	//生成广播接收器
	let receiver = plus.android.implements('io.dcloud.android.content.BroadcastReceiver', {
		onReceive: (context, intent) => { //接收广播回调  
			plus.android.importClass(intent);
			mainActivity.unregisterReceiver(receiver); //取消监听
			callBack()
		}
	});
	let IntentFilter = plus.android.importClass('android.content.IntentFilter');
	let Intent = plus.android.importClass('android.content.Intent');
	let filter = new IntentFilter();
	filter.addAction(Intent.ACTION_PACKAGE_ADDED); //监听APP安装     
	filter.addDataScheme("package");
	mainActivity.registerReceiver(receiver, filter); //注册广播
 
}