import correctSound from "../assets/sounds/dobra.mp3";
import wrongSound from "../assets/sounds/zla.mp3";
import eliminatedSound from "../assets/sounds/odpadniencie.mp3";
import buzzSound from "../assets/sounds/zgloszenie.mp3";
const sounds = {
    correct: new Audio(correctSound),
    wrong: new Audio(wrongSound),
    eliminated: new Audio(eliminatedSound),
    buzz: new Audio(buzzSound),
}

export function playSound(sound: keyof typeof sounds) {
    const name = sounds[sound]
    if (!name) return;
    name.currentTime = 0;
    name.play().catch(err => console.error(err));
}