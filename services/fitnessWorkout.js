import fetch from "node-fetch";

//const BACK_CI_URL = "https://fitnessworkout.onrender.com";

const BACK_CI_URL = "http://localhost:4000";

async function getRecords() {
	return fetch(`${BACK_CI_URL}/gt/train/records`).then((res) => res.json());
}

async function getInfoFitnessWorkout() {
	return fetch(`${BACK_CI_URL}/info-for-gt`).then((res) => res.json());
}

export { getRecords, getInfoFitnessWorkout };
