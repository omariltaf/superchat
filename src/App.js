import { useState, useRef } from "react";
import "./App.css";

import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

firebase.initializeApp({
	apiKey: process.env.REACT_APP_FIREBASE_API_KEY, // Committing api key to deploy with github pages
	authDomain: "fir-play-2ffe3.firebaseapp.com",
	projectId: "fir-play-2ffe3",
	storageBucket: "fir-play-2ffe3.appspot.com",
	messagingSenderId: "421379434878",
	appId: "1:421379434878:web:e4ae1020cf3f30ffde2b2f",
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
	const [user] = useAuthState(auth);

	return (
		<div className="App">
			<header>
				<SignOut />
			</header>
			<section>{user ? <ChatRoom /> : <SignIn />}</section>
		</div>
	);
}

function SignIn() {
	const signInWithGoogle = () => {
		const provider = new firebase.auth.GoogleAuthProvider();
		auth.signInWithPopup(provider);
	};
	return <button onClick={signInWithGoogle}>Sign in with Google</button>;
}

function SignOut() {
	return (
		auth.currentUser && <button onClick={() => auth.signOut()}>Sign Out</button>
	);
}

function ChatRoom() {
	const dummy = useRef();

	const messagesRef = firestore.collection("messages");
	const query = messagesRef.orderBy("createdAt").limit(100);
	const [messages] = useCollectionData(query, { idField: "id" });

	const [formValue, setFormValue] = useState("");

	const sendMessage = async (e) => {
		e.preventDefault();

		const { uid, photoURL } = auth.currentUser;

		await messagesRef.add({
			text: formValue,
			createdAt: firebase.firestore.FieldValue.serverTimestamp(),
			uid,
			photoURL,
		});

		setFormValue("");
		dummy.current.scrollIntoView({ behavior: "smooth" });
	};

	return (
		<>
			<main>
				{messages &&
					messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
				<div ref={dummy}></div>
			</main>

			<form onSubmit={sendMessage}>
				<input
					value={formValue}
					onChange={(e) => setFormValue(e.target.value)}
				/>
				<button type="submit">Send</button>
			</form>
		</>
	);
}

function ChatMessage(props) {
	const { text, uid, photoURL } = props.message;

	const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

	return (
		<div className={`message ${messageClass}`}>
			<img src={photoURL} alt="User" />
			<p>{text}</p>
		</div>
	);
}

export default App;
