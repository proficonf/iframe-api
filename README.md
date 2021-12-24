# iframe-api
Proficonf Embedded API

## Usage example

```js
const room = EmbeddedRoom.create({
    meetingId: 'xYZrEk33D',
    rootElement: document.querySelector('div#conference'),
    user: {
        name: 'John Doe',
        locale: 'en'
    },
    iframe: {
        width: '100%',
        height: '100vh',
        style: {
            border: '1px solid black',
            backgroundColor: 'grey'
        }
    }
});

await room.join();

// enabling media devices
await room.enableCamera();
await room.enableMicrophone();
await room.enableScreenSharing();

```

## Room object

### room.join()

Initializes iframe element and joins the meeting. 
Throws: `Room initialization timeout`

```js
await room.join();

console.log('Meeting is ready to use');
```

### room.iframeElement

Returns the reference to iframe DOM element.

### room.rootElement

Returns the reference to root DOM  element.

### room.enableCamera( constraints )

Enables local camera. 

#### Constraints:

| Param     | Type   | Description                                                                                                       |
|-----------|--------|-------------------------------------------------------------------------------------------------------------------|
| deviceId  | String | [MediaTrackConstraints.deviceId](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints/deviceId) |
| encodings | Array  | [RTPEncodings](https://developer.mozilla.org/en-US/docs/Web/API/RTCRtpEncodingParameters)                         |
|           |        |                                                                                                                   |

Returns `Promise<CameraState>`: 

```ts
interface RTPEncodings {
    rid?: number;
    maxFramerate?: number;
    maxBitrate?: number;
    dtx?: boolean;
    codecPayloadType?: string;
    scaleResolutionDownBy?: number;
}

interface CameraState {
    isEnabled: Boolean;
    deviceId: String;
    currentEncodings: LayerEncoding[];
}

```

Example: 

```js 
const cameraState = await room.enableCamera({
    encodings: [
        { scaleResolutionDownBy: 4 },
        { scaleResolutionDownBy: 2 },
        { scaleResolutionDownBy: 1 }
    ]
})
```

### room.disableCamera()

Disables local camera. 

Example: 

```js 
const cameraState = await room.disableCamera();
```

### room.updateCameraDevice(deviceId)

Changes device of local camera.

Example: 

```js 
const cameraState = await room.updateCameraDevice(deviceId);
```

### room.switchCamera()

Change camera device to next available

Example: 

```js 
const cameraState = await room.switchCamera();
```

### room.getCameraState()

Obtains camera state

Example: 

```js 
const cameraState = await room.getCameraState();
```

### room.getDeviceList()

Obtains available device list

Returns `Promise<Device[]>`

```ts
interface Device {
    deviceId: string;
    groupId: string;
    kind: string;
    label: string;
    isActive: boolean;
}
```

Example: 

```js 
const deviceList = await room.getDeviceList();
```

### room.enableMicrophone( constraints )

Enables local microphone. 

#### Constraints:

| Param     | Type   | Description                                                                                                       |
|-----------|--------|-------------------------------------------------------------------------------------------------------------------|
| deviceId  | String | [MediaTrackConstraints.deviceId](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints/deviceId) |
|           |        |                                                                                                                   |

Returns `Promise<MicrophoneState>`: 

```ts

interface MicrophoneState {
    isEnabled: Boolean;
    deviceId: String;
}

```

Example: 

```js 
const microphoneState = await room.enableMicrophone();
```

### room.disableMicrophone()

Disables local microphone. 

Example: 

```js 
const microphoneState = await room.disableMicrophone();
```

### room.updateMicrophoneDevice(deviceId)

Changes device of local microphone.

Example: 

```js 
const microphoneState = await room.updateMicrophoneDevice(deviceId);
```

### room.getMicrophoneState()

Obtains microphone state

Example: 

```js 
const microphoneState = await room.getMicrophoneState();
```

### room.switchMicrophone()

Change microphone device to next available

Example: 

```js 
const microphoneState = await room.switchMicrophone();
```

### room.enableScreenSharing( constraints )

Enables screenSharing. 

#### Constraints:

| Param     | Type   | Description                                                                                                       |
|-----------|--------|-------------------------------------------------------------------------------------------------------------------|
| encodings | Array  | [RTPEncodings](https://developer.mozilla.org/en-US/docs/Web/API/RTCRtpEncodingParameters)                         |
|           |        |                                                                                                                   |

Returns `Promise<ScreenSharingState>`: 

```ts

interface ScreenSharingState {
    isEnabled: Boolean;
    deviceId: String;
    currentEncodings: LayerEncoding[]
}

```

Example: 

```js 
const screenSharingState = await room.enableScreenSharing();
```

### room.disableScreenSharing()

Disables screen sharing. 

Example: 

```js 
const screenSharingState = await room.disableScreenSharing();
```

### room.getScreenSharingState()

Obtains screen sharing state

Example: 

```js 
const screenSharingState = await room.getScreenSharingState();
```


### room.getParticipants()

Obtains list of participants in the meeting.
Returns: `Promise<MeetingParticipant[]>`

```ts
interface MeetingParticipant {
    id: string;
    isLocal: boolean;
    avatarUrl: string;
    name: string;
    isBlocked: string;
    isAudioEnabled: boolean;
    isScreenEnabled: boolean;
    isVideoEnabled: boolean;
    hasAtLeastOneDeviceEnabled: boolean;
    isPinned: boolean;
    isDominantSpeaker: boolean;
    lastPresence: Object;
    role: string;
}
```

Example: 

```js
const participants = await room.getParticipants();

```

### room.getParticipantById( id )

Get participant by id.
Returns: `Promise<MeetingParticipant>`

Example: 

```js
const participant = await room.getParticipantById('fake-id');

```

### room.banParticipant( id )

Ban participant by id. Restrict access to room for specified participant.

Example: 

```js
await room.banParticipant('fake-id');

```

### room.blockParticipant( id )

Block participant by id. Restrict ability to use chat and enable devices for specified participant.

Example: 

```js
await room.blockParticipant('fake-id');

```

### room.unblockParticipant( id )

Removes block from participant. Grant ability to use chat and enable devices for specified participant.

Example: 

```js
await room.unblockParticipant('fake-id');

```

### room.renameParticipant({ firstName, lastName })

Rename local participant

Example: 

```js
await room.renameParticipant({ firstName: 'john', lastName: 'Doe' });

```

### room.toggleChat({ participantId, isChatAllowed })

Toggle ability to use chat for specified participant.
Params: 

| Param         | Type    | Description            |
|---------------|---------|------------------------|
| participantId | String  | Participant identifier |
| isChatAllowed | Boolean | Ability to use chat    |

Example: 

```js
await room.toggleChat({ participantId: 'fake-id', isChatAllowed: false });

```

### room.muteParticipantMicrophone(participantId)

Disables participant microphone

Params: 

| Param         | Type    | Description            |
|---------------|---------|------------------------|
| participantId | String  | Participant identifier |

Example: 

```js
await room.muteParticipantMicrophone('fake-participant-id');

```

### room.askToUnmuteMicrophone(participantId)

Sends request to selected participant in order to enable microphone.

Params: 

| Param         | Type    | Description            |
|---------------|---------|------------------------|
| participantId | String  | Participant identifier |

Example: 

```js
await room.askToUnmuteMicrophone('fake-participant-id');

```

### room.blockParticipantMicrophone(participantId)

Disables a microphone of the specified participant. Participant becomes unable to use microphone. 

Params: 

| Param         | Type    | Description            |
|---------------|---------|------------------------|
| participantId | String  | Participant identifier |

Example: 

```js
await room.blockParticipantMicrophone('fake-participant-id');

```

### room.unblockParticipantMicrophone(participantId)

Allows to use microphone for specified participant.

Params: 

| Param         | Type    | Description            |
|---------------|---------|------------------------|
| participantId | String  | Participant identifier |

Example: 

```js
await room.unblockParticipantMicrophone('fake-participant-id');

```

### room.muteParticipantCamera(participantId)

Disables a camera for specified participant.

Params: 

| Param         | Type    | Description            |
|---------------|---------|------------------------|
| participantId | String  | Participant identifier |

Example: 

```js
await room.muteParticipantCamera('fake-participant-id');

```

### room.askToUnmuteCamera(participantId)

Sends request to the specified participant in order to unmute the camera.

Params: 

| Param         | Type    | Description            |
|---------------|---------|------------------------|
| participantId | String  | Participant identifier |

Example: 

```js
await room.askToUnmuteCamera('fake-participant-id');

```

### room.blockParticipantCamera(participantId)

Disables a camera of specified participant. Participant becomes unable to use camera.

Params: 

| Param         | Type    | Description            |
|---------------|---------|------------------------|
| participantId | String  | Participant identifier |

Example: 

```js
await room.blockParticipantCamera('fake-participant-id');

```

### room.unblockParticipantCamera(participantId)

Allows to use a camera of specified participant. 

Params: 

| Param         | Type    | Description            |
|---------------|---------|------------------------|
| participantId | String  | Participant identifier |

Example: 

```js
await room.unblockParticipantCamera('fake-participant-id');

```

### room.setParticipantRole({ participantId, role })

Set the role of the specified participant

Params: 

| Param         | Type            | Description            |
|---------------|-----------------|------------------------|
| participantId | String          | Participant identifier |
| role          | ParticipantRole | Role to be set         |

```ts
enum ParticipantRole {
    GUEST = 'guest'; // Unable to join. Able to ask for join.
    BLOCKED = 'blocked'; // Stay in room, unable to use devices, uanble to share content, unable to write ito chat
    PARTICIPANT = 'participant'; // Default role
    SPEAKER = 'speaker'; // Can use devices. Can share content. 
    MODERATOR = 'moderator';
    OWNER = 'owner';
    BANNED_USER = 'banned_user'; // Unable to join. Unable to ask for join.
}

```

Example: 

```js
await room.setParticipantRole({ participantId: 'fake-id', role: 'moderator' });

```

### room.setScreenLayout(layout)

Set layout of video elements on the screen.

Params: 

| Param   | Type       | Description  |
|---------|------------|--------------|
| layout  | RoomLayout | Room layout  |

```ts
enum RoomLayout {
    ACTIVE_SPEAKER = 'activeSpeaker';
    TILED = 'tiled';
}

```

Example: 

```js
await room.setScreenLayout('tiled');

```


### room.startMeeting()

Set meeting state to started.


Example: 

```js
await room.startMeeting();

```

### room.finishMeeting()

Kick all participants and set meeting state to finished.

Example: 

```js
await room.finishMeeting();

```

### room.startRecording(uiState)

Launch recording of the meeting.

Params: 

| Param   | Type             | Description              |          |
|---------|------------------|--------------------------|----------|
| uiState | RecordingUIState | Recording configuration  | Optional |


```ts
interface RecordingUIState {
    chatVisible?: boolean,
    previewsVisible?: boolean,
    pinnedUserId?: string,
}
```

Example: 

```js
await room.startRecording(); // default config

await room.startRecording({ chatVisible: true });

```

### room.setRecordingConfig(uiState)

Update recording config.

Params: 

| Param   | Type             | Description              |          |
|---------|------------------|--------------------------|----------|
| uiState | RecordingUIState | Recording configuration  | Optional |

Example: 

```js
await room.setRecordingConfig({ chatVisible: true, pinnedUserId: 'fake-participant-id' });

```


### room.stopRecording()

Stop recording of the meeting.

Example: 

```js
await room.stopRecording();

```

### room.getRecordingState()

Get state of the recorder.

Returns: `Promise<RecordingState>`;

```ts
interface RecordingState {
    id: string;
    authorUserId: string;
    isFresh: boolean;
    eventId: string;
    errors: CapturerError[];
    outputs: CapturerOutput[];
    createdTimestamp: number;
    updatedTimestamp: number;
}

```

Example: 

```js
await room.getRecordingState();

```

### room.sendChatMessage(message)

Send message to the chat.

Example: 

```js
await room.sendChatMessage('Hello ppl');

```

### room.startStream({ serverUrl, streamKey })

Start streaming to specified RTMP server. 

Example: 

```js
await room.startStream({ serverUrl: 'rtmp://a.rtmp.youtube.com/live2', streamKey: 'fake-stream-key' });

```

### room.stopStream({ serverUrl, streamKey })

Stop streaming to specified RTMP server. 

Example: 

```js
await room.stopStream({ serverUrl: 'rtmp://a.rtmp.youtube.com/live2', streamKey: 'fake-stream-key' });

```

### room.stopAllStreams()

Stop all active streams.

Example: 

```js
await room.stopAllStreams();

```

### room.on(eventName, callback)

Listen for meeting event. 
Available events:

```ts
enum MeetingEvent {
    MEETING_STATE_CHANGED = 'meetingStateChanged';
    MEETING_PROPERTY_CHANGED = 'meetingPropertyChanged';
    PARTICIPANT_PROPERTY_CHANGED = 'participantPropertyChanged';
    PARTICIPANT_ROLE_CHANGED = 'participantRoleChanged';
    PARTICIPANT_JOINED = 'participantJoined';
    PARTICIPANT_LEFT = 'participantLeft';
    PERMISSIONS_CHANGED = 'permissionsChanged';
    CHAT_MESSAGE_RECEIVED = 'chatMessageReceived';
    SHARING_CHANGED = 'sharingChanged';
    CHAT_MESSAGE_DELETED = 'chatMessageDeleted';
    DEVICE_LIST_CHANGED = 'deviceListChanged';
    RTC_CONNECTION_FAILED = 'rtcConnectionFailed';
    MEDIA_SESSION_STARTED = 'mediaSessionStarted';
    TRACK_ADDED = 'trackAdded';
    TRACK_REMOVED = 'trackRemoved';
    PERMISSION_PROMPT_IS_SHOWN = 'permissionPromptIsShown';
    GET_USER_MEDIA_PERMISSION_DENIED = 'getUserMediaPermissionDenied';
    GET_USER_MEDIA_ERROR = 'getUserMediaError';
}

```

Example: 

```js
room.on('*', (event) =>{
    console.log('Some event received', event);
});

room.on('meetingStateChanged', (event) =>{
    console.log('meeting state changed to %s', event.state);
});

```

### room.once(eventName, callback)

Listen for meeting event only once.

### room.removeListener(eventName, callback)

Removes event listener