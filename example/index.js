let room;
const meetingId = 'proficonf';
const userName = 'John Doe';


async function initializeRoom() {
    room = window.Proficonf.EmbeddedRoom.create({
        meetingId,
        rootElement: document.querySelector('div#iframeWrapper'),
        user: {
            name: userName,
            locale: 'en'
        },
        iframe: {
            width: '100%',
            height: '70vh',
            style: {
                border: '3px solid black',
                backgroundColor: 'grey'
            }
        },
        appOrigin: 'http://host.docker.internal:8000'
    });

    room.on('*', (...args) => {
        console.log('Event received', args);
    });

    await room.join();
}

function enableMicrophone() {
    room.enableMicrophone();
}

function disableMicrophone() {
    room.disableMicrophone();
}

function enableCamera() {
    return room.enableCamera();
}

function disableCamera() {
    return room.disableCamera();
}

(()=>{
    initializeRoom();
})();