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
await room.mediaSources.camera.enable();
await room.mediaSources.microphone.enable();
await room.mediaSources.screenCapturing.enable();

const availableDevices = await room.mediaSources.listAvailableDevices();

// changing current device
await room.mediaSources.camera.switch({
    deviceId: availableDevices[0].id
});

await room.mediaSources.microphone.switch({
    deviceId: availableDevices[1].id
});

```