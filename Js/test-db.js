// Access the Firestore instance and functions from the window object
// Make sure this script runs AFTER the Firebase initialization script in index.html
const db = window.db;
const collection = window.firebase_collection;
const addDoc = window.firebase_addDoc;
const getDocs = window.firebase_getDocs;
const serverTimestamp = window.firebase_serverTimestamp; // Import FieldValue for serverTimestamp

document.addEventListener("DOMContentLoaded", () => {
    const addMessageButton = document.getElementById('addMessageButton');
    const getMessagesButton = document.getElementById('getMessagesButton');
    const messagesOutput = document.getElementById('messagesOutput');

    // Function to add a new message
    async function addMyFirstMessage() {
        if (!db) {
            console.error("Firestore database (db) is not initialized.");
            return;
        }
        try {
            // Use the modular functions directly
            const docRef = await addDoc(collection(db, "messages"), {
                text: "Hello from my GitHub Pages site! " + new Date().toLocaleTimeString(), // Add time for unique messages
                timestamp: serverTimestamp() // Use serverTimestamp directly
            });
            console.log("Document written with ID: ", docRef.id);
            alert("Message added! Check your Firebase Console or click 'Get Messages'.");
        } catch (e) {
            console.error("Error adding document: ", e);
            alert("Error adding message. Check console for details.");
        }
    }

    // Function to get messages
    async function getMyMessages() {
        if (!db) {
            console.error("Firestore database (db) is not initialized.");
            return;
        }
        try {
            messagesOutput.innerHTML = 'Loading messages...';
            const querySnapshot = await getDocs(collection(db, "messages"));
            messagesOutput.innerHTML = ''; // Clear previous output
            if (querySnapshot.empty) {
                messagesOutput.innerHTML = 'No messages found yet.';
            } else {
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const messageElement = document.createElement('p');
                    messageElement.textContent = `ID: ${doc.id}, Text: ${data.text}, Timestamp: ${data.timestamp ? new Date(data.timestamp.toDate()).toLocaleString() : 'N/A'}`;
                    messagesOutput.appendChild(messageElement);
                    console.log(`${doc.id} => `, data);
                });
            }
        } catch (e) {
            console.error("Error getting documents: ", e);
            alert("Error getting messages. Check console for details.");
        }
    }

    // Attach event listeners to your buttons
    if (addMessageButton) {
        addMessageButton.addEventListener('click', addMyFirstMessage);
    }
    if (getMessagesButton) {
        getMessagesButton.addEventListener('click', getMyMessages);
    }
});