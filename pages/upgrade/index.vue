<template>
	<view class="upgrade-container" @click.stop>
		<view class="upgrade-popup">
			<!-- 顶部图标区域 -->
			<view class="header-section">
				<view class="icon-wrapper">
					<image class="icon" src="/unpackage/res/icons/76x76.png" mode="aspectFit"></image>
				</view>
				<view class="version-badge">新版本</view>
			</view>
			
			<!-- 主要内容区域 -->
			<view class="main-content">
				<view class="title-section">
					<text class="main-title">发现新版本</text>
					<text class="version-name">{{ versionName }}</text>
				</view>
				
				<view class="content-section">
					<view class="content-title">
						<text class="title-icon">✨</text>
						<text class="title-text">更新内容</text>
					</view>
					<scroll-view class="desc-wrapper" scroll-y>
						<view class="desc-content" v-html="versionDesc"></view>
					</scroll-view>
				</view>
			</view>
			
			<!-- 底部按钮区域 -->
			<view class="footer-section">
				<!-- 下载状态-进度条显示 -->
				<view v-if="isStartDownload" class="download-section">
					<view class="progress-container" @click="handleInstallApp">
						<view class="progress-bar-wrapper">
							<view class="progress-bar-bg">
								<view class="progress-bar-fill" :style="setProStyle">
									<view class="progress-shine"></view>
								</view>
							</view>
							<view class="progress-text">{{ percentText }}</view>
						</view>
					</view>
				</view>
				<!-- 强制更新 -->
				<view v-else-if="isForceUpdate" class="button-section">
					<view class="btn-primary" @click="handleUpgrade">
						<text class="btn-text">立即更新</text>
					</view>
				</view>
				<!-- 可选择更新 -->
				<view v-else class="button-section">
					<view class="btn-secondary" @click="handleSkip">
						<text class="btn-text">跳过版本</text>
					</view>
					<view class="btn-primary" @click="handleUpgrade">
						<text class="btn-text">立即更新</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		downloadApp,
		installApp
	} from '@/common/upgrade.js';
	import {
		onLoad,
		onBackPress
	} from "@dcloudio/uni-app";
	import storageManager from '@/common/storage.js';

	export default {
		data() {
			return {
				isForceUpdate: false, // 是否强制更新
				versionName: '', // 版本名称
				versionDesc: '', // 更新说明
				downloadUrl: '', // APP 下载链接
				isDownloadFinish: false, // 是否下载完成
				hasProgress: false, // 是否能显示进度条
				currentPercent: 0, // 当前下载百分比
				isStartDownload: false, // 是否开始下载
				fileName: '' // 下载后 app 本地路径名称
			}
		},
		computed: {
			setProStyle() {
				return {
					width: (this.currentPercent || 0) + '%'
				};
			},
			percentText() {
				let percent = this.currentPercent;
				if (typeof percent !== 'number' || isNaN(percent)) return '准备下载...';
				if (percent < 100) return `${percent}%`;
				return '下载完成，点击安装';
			}
		},
		onLoad(option) {
			const obj = JSON.parse(decodeURIComponent(option.obj));
			this.versionName = obj.versionName || obj.contents; // 版本名称
			this.versionDesc = obj.versionDesc || "修复若干bug"; // 更新说明
			this.downloadUrl = obj.downloadUrl || obj.url; // 下载链接
			this.isForceUpdate = obj.is_mandatory === true; // 是否强制更新，默认false（可跳过）
		},
		onBackPress(options) {
			// 禁用返回（强制更新时）
			if (this.isForceUpdate && options.from === 'backbutton') {
				return true;
			}
		},
		methods: {
			handleUpgrade() {
				if (this.downloadUrl) {
					this.isStartDownload = true;
					// 开始下载 App
					downloadApp(this.downloadUrl, (current) => {
						// 下载进度监听
						this.hasProgress = true;
						this.currentPercent = current;
					}).then((newFileName) => {
						// 下载完成
						this.isDownloadFinish = true;
						this.fileName = newFileName;
						if (newFileName) {
							// 自动安装 App
							this.handleInstallApp();
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
			},
			handleInstallApp() {
				// 下载完成才能安装，防止下载过程中点击
				if (this.isDownloadFinish && this.fileName) {
					installApp(this.fileName, () => {
						// 安装成功,关闭升级弹窗
						uni.navigateBack();
					});
				}
			},
			handleClose() {
				uni.navigateBack();
			},
			handleSkip() {
				// 保存跳过的版本号
				if (this.versionName) {
					const saved = storageManager.setSkippedVersion(this.versionName);
					console.log('跳过版本:', this.versionName, '保存结果:', saved);
					console.log('当前跳过的版本列表:', storageManager.getSkippedVersions());
					uni.showToast({
						title: '已跳过此版本',
						icon: 'success',
						duration: 1500
					});
				}
				uni.navigateBack();
			}
		}
	}
</script>

<style>
	page {
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(10rpx);
	}
</style>

<style lang="scss" scoped>
	.upgrade-container {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9999;
	}

	.upgrade-popup {
		width: 640rpx;
		max-width: 90%;
		background: #ffffff;
		border-radius: 32rpx;
		box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.15);
		overflow: hidden;
		animation: popupShow 0.3s ease-out;
	}

	@keyframes popupShow {
		from {
			opacity: 0;
			transform: scale(0.9) translateY(-20rpx);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	// 顶部图标区域
	.header-section {
		position: relative;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 60rpx 40rpx 40rpx;
		text-align: center;

		.icon-wrapper {
			width: 120rpx;
			height: 120rpx;
			margin: 0 auto 20rpx;
			background: rgba(255, 255, 255, 0.2);
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			backdrop-filter: blur(10rpx);

			.icon {
				width: 76rpx;
				height: 76rpx;
			}
		}

		.version-badge {
			display: inline-block;
			padding: 8rpx 24rpx;
			background: rgba(255, 255, 255, 0.25);
			border-radius: 20rpx;
			font-size: 24rpx;
			color: #ffffff;
			font-weight: 500;
			backdrop-filter: blur(10rpx);
		}
	}

	// 主要内容区域
	.main-content {
		padding: 40rpx;

		.title-section {
			text-align: center;
			margin-bottom: 40rpx;

			.main-title {
				display: block;
				font-size: 40rpx;
				font-weight: 700;
				color: #333333;
				margin-bottom: 12rpx;
			}

			.version-name {
				display: block;
				font-size: 32rpx;
				color: #667eea;
				font-weight: 600;
			}
		}

		.content-section {
			background: #f8f9fa;
			border-radius: 16rpx;
			padding: 24rpx;
			margin-bottom: 20rpx;

			.content-title {
				display: flex;
				align-items: center;
				margin-bottom: 20rpx;

				.title-icon {
					font-size: 32rpx;
					margin-right: 12rpx;
				}

				.title-text {
					font-size: 28rpx;
					font-weight: 600;
					color: #333333;
				}
			}

			.desc-wrapper {
				max-height: 300rpx;
				min-height: 80rpx;
			}

			.desc-content {
				font-size: 26rpx;
				line-height: 1.8;
				color: #666666;
				white-space: pre-wrap;
				word-break: break-word;
			}
		}
	}

	// 底部按钮区域
	.footer-section {
		padding: 0 40rpx 40rpx;

		.button-section {
			display: flex;
			gap: 20rpx;
		}

		.btn-primary {
			flex: 1;
			height: 88rpx;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			border-radius: 44rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
			transition: all 0.3s;

			&:active {
				transform: scale(0.98);
				box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
			}

			.btn-text {
				font-size: 32rpx;
				font-weight: 600;
				color: #ffffff;
			}
		}

		.btn-secondary {
			flex: 1;
			height: 88rpx;
			background: #f5f5f5;
			border-radius: 44rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			transition: all 0.3s;

			&:active {
				transform: scale(0.98);
				background: #eeeeee;
			}

			.btn-text {
				font-size: 32rpx;
				font-weight: 500;
				color: #666666;
			}
		}

		// 下载进度区域
		.download-section {
			.progress-container {
				width: 100%;
			}

			.progress-bar-wrapper {
				position: relative;
				width: 100%;
				height: 88rpx;
				background: #f5f5f5;
				border-radius: 44rpx;
				overflow: hidden;
			}

			.progress-bar-bg {
				position: relative;
				width: 100%;
				height: 100%;
				background: #f0f0f0;
				border-radius: 44rpx;
				overflow: hidden;
			}

			.progress-bar-fill {
				position: absolute;
				left: 0;
				top: 0;
				height: 100%;
				background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
				border-radius: 44rpx;
				transition: width 0.3s ease;
				overflow: hidden;

				.progress-shine {
					position: absolute;
					top: 0;
					left: -100%;
					width: 100%;
					height: 100%;
					background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
					animation: shine 2s infinite;
				}
			}

			@keyframes shine {
				0% {
					left: -100%;
				}
				100% {
					left: 100%;
				}
			}

			.progress-text {
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
				font-size: 28rpx;
				font-weight: 600;
				color: #667eea;
				z-index: 10;
				white-space: nowrap;
			}
		}
	}
</style>

