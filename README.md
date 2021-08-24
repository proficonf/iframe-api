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


room.on('conference:roomJoined', ()=> console.log('joined'));
room.on('conference:participantJoined', (participant)=> console.log('participant joined', participant));

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
interface LayerEncoding {
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

### room.updateCamera(deviceId)

Changes device of local camera.

Example: 

```js 
const cameraState = await room.updateCamera(deviceId);
```

### room.getCameraState()

Obtains camera state

Example: 

```js 
const cameraState = await room.getCameraState();
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

### room.updateMicrophone(deviceId)

Changes device of local microphone.

Example: 

```js 
const microphoneState = await room.updateMicrophone(deviceId);
```

### room.getMicrophoneState()

Obtains microphone state

Example: 

```js 
const microphoneState = await room.getMicrophoneState();
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

### room.on(eventName, callback)

Allows to listen for meeting events.

| Event name                            | Description                                                                               |
|---------------------------------------|-------------------------------------------------------------------------------------------|
| stage.contentChanged                  | Indicates current state content change                                                    |
| conference.conferenceStateChanged     | Indicates change of meeting state. Like finished or started                               |
| conference.conferencePropertyChanged  | Indicates meeting level property change.  Example: recording status changed, host changed |
| conference.joined                     | Local participant joined to the meeting.                                                  |
| conference.conferenceHostChanged      | Host user changed                                                                         |
| conference.audioMuteStatusChanged     | Local audio mute status changes.  Indicates mute by moderator                             |
| conference.videoMuteStatusChanged     | Local video mute status changes.  Indicates mute by moderator                             |
| conference.trackAdded                 | New media is ready to be played                                                           |
| conference.trackReplaced              | Indicates change of media source for existing media                                       |
| conference.trackRemoved               | Existing media is removed from meeting                                                    |
| conference.availableDevicesChanged    | Available device list changed                                                             |
| conference.roleChanged                | Participant role changed                                                                  |
| conference.userJoined                 | Participant joined the meeting                                                            |
| conference.userLeft                   | Participant left the meeting                                                              |
| conference.userPermissionsUpdated     | Local participant permissions changed                                                     |
| conference.chatMessageReceived        | New chat message received                                                                 |
| conference.localRoleChanged           | Local role changed                                                                        |
| conference.sharingChanged             | Sharing content changed                                                                   |
| conference.enableDeviceRequest        | Moderator asks to enable device                                                           |
| conference.deviceStateModified        | State of media device changed                                                             |
| conference.deviceBlockChanged         | Device blocked / unblocked by moderator                                                   |
| conference.chatToggled                | Ability to use chat changed by moderator                                                  |
| conference.eventNameChanged           | Meeting name changed                                                                      |
| conference.participantPropertyChanged | Property of participant changed                                                           |
| conference.pinnedUserChanged          | Pinned user changed                                                                       |
|                                       |                                                                                           |

### room.once(eventName, callback)

Allows to listen for meeting event only once.

### room.removeListener(eventName, callback)

Removes event listener