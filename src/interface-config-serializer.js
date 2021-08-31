export class InterfaceConfigSerializer {
    constructor(lzString) {
        this._lzString = lzString;
    }

    serializeToString(interfaceConfig) {
        const config = {
            leftbar: {},
            topbar: {},
        };

        if (interfaceConfig.leftbar.disabled) {
            interfaceConfig.leftbar.disabled = 1;
        }
        if (interfaceConfig.leftbar.disableChatButton) {
            config.leftbar.chatButton = 0;
        }
        if (interfaceConfig.leftbar.disableSharingCenter) {
            config.leftbar.sharingCenterButton = 0;
        }
        if (interfaceConfig.leftbar.disableSharedFiles) {
            config.leftbar.sharedFilesButton = 0;
        }
        if (interfaceConfig.leftbar.disableParticipantsList) {
            config.leftbar.participantsButton = 0;
        }

        if (interfaceConfig.topbar.disabled) {
            config.topbar.disabled = 1;
        }
        if (interfaceConfig.topbar.disableDeviceControls) {
            config.topbar.deviceControls = 0;
        }
        if (interfaceConfig.topbar.disableCameraControl) {
            config.topbar.cameraControl = 0;
        }
        if (interfaceConfig.topbar.disableMicrophoneControl) {
            config.topbar.microphoneControl = 0;
        }
        if (interfaceConfig.topbar.disableLeaveButton) {
            config.topbar.leaveButton = 0;
        }
        if (interfaceConfig.topbar.disableMeetingName) {
            config.topbar.meetingName = 0;
        }
        if (interfaceConfig.topbar.disableRoomLocker) {
            config.topbar.roomLocker = 0;
        }
        if (interfaceConfig.topbar.disableTimer) {
            config.topbar.timer = 0;
        }
        if (interfaceConfig.topbar.disableQualityIndicator) {
            config.topbar.qualityIndicator = 0;
        }
        if (interfaceConfig.topbar.disableInviteButton) {
            config.topbar.inviteButton = 0;
        }
        if (interfaceConfig.topbar.disableRecordingcontrol) {
            config.topbar.recordingButton = 0;
        }
        if (interfaceConfig.topbar.disableStreamingControl) {
            config.topbar.streamingButton = 0;
        }
        if (interfaceConfig.topbar.disableDisplayModeButton) {
            config.topbar.displayModeButton = 0;
        }
        if (interfaceConfig.topbar.disableConfigButton) {
            config.topbar.configButton = 0;
        }
        if (interfaceConfig.topbar.disableLogo) {
            config.topbar.logo = 0;
        }

        if (interfaceConfig.primaryColor !== 'default') {
            config.primaryColor = interfaceConfig.primaryColor;
        }
        if (interfaceConfig.logoSrc !== 'default') {
            config.logoSrc = interfaceConfig.logoSrc;
        }
        if (interfaceConfig.displayMode !== 'default') {
            config.displayMode = interfaceConfig.displayMode;
        }

        return this._lzString.compressToEncodedURIComponent(
            JSON.stringify(config)
        );
    }
}
