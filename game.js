/**
 * Tower of Hanoi Game Logic with Firebase Ranking
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, set, onValue, query, orderByChild, limitToFirst } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDc3K47vyQgRXxj93abTxy8w7Aqp5aWuZs",
    authDomain: "hanoi-tower-65812.firebaseapp.com",
    projectId: "hanoi-tower-65812",
    storageBucket: "hanoi-tower-65812.firebasestorage.app",
    messagingSenderId: "18952793189",
    appId: "1:18952793189:web:c4328578078c94db1b6a8c",
    measurementId: "G-DSRS022MWB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

class TowerOfHanoi {
    constructor() {
        this.numDisks = 4;
        this.pegs = [[], [], []];
        this.moves = 0;
        this.bestMoves = localStorage.getItem('hanoi-best') || '-';
        this.selectedDisk = null;
        this.selectedPegIndex = null;
        this.colors = [
            'linear-gradient(135deg, #FF6B6B 0%, #EE5253 100%)', // Ruby
            'linear-gradient(135deg, #f1c40f 0%, #d4ac0d 100%)', // Gold
            'linear-gradient(135deg, #1abc9c 0%, #16a085 100%)', // Turquoise
            'linear-gradient(135deg, #3498db 0%, #2980b9 100%)', // Sapphire
            'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)', // Amethyst
            'linear-gradient(135deg, #e67e22 0%, #d35400 100%)', // Amber
            'linear-gradient(135deg, #ecf0f1 0%, #bdc3c7 100%)', // Silver
            'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)'  // Emerald
        ];

        this.initDOM();
        this.reset();
        this.setupEvents();
    }

    initDOM() {
        this.pegEls = [
            document.getElementById('peg-0'),
            document.getElementById('peg-1'),
            document.getElementById('peg-2')
        ];
        this.moveCountEl = document.getElementById('move-count');
        this.bestMovesEl = document.getElementById('best-moves');
        this.bestMovesEl.textContent = this.bestMoves;
        this.winScreen = document.getElementById('win-screen');
        this.finalMovesEl = document.getElementById('final-moves');
        this.difficultySelect = document.getElementById('difficulty');

        // Ranking elements
        this.playerNameInput = document.getElementById('player-name');
        this.submitScoreBtn = document.getElementById('submit-score');
        this.rankingContainer = document.getElementById('ranking-container');
        this.rankingList = document.getElementById('ranking-list');
        this.closeRankingBtn = document.getElementById('close-ranking');
    }

    reset() {
        this.numDisks = parseInt(this.difficultySelect.value);
        this.pegs = [[], [], []];
        this.moves = 0;
        this.selectedDisk = null;
        this.selectedPegIndex = null;
        this.updateMoveCount();

        // Populate first peg
        for (let i = this.numDisks; i > 0; i--) {
            this.pegs[0].push(i);
        }

        this.render();
        this.winScreen.classList.add('hidden');
        document.getElementById('ranking-input').classList.remove('hidden');
    }

    render() {
        this.pegs.forEach((disks, pegIdx) => {
            const diskContainer = this.pegEls[pegIdx].querySelector('.disks');
            diskContainer.innerHTML = '';

            disks.forEach((diskSize, idx) => {
                const diskEl = document.createElement('div');
                diskEl.className = 'disk';

                if (this.selectedDisk === diskSize &&
                    this.selectedPegIndex === pegIdx &&
                    idx === disks.length - 1) {
                    diskEl.classList.add('selected');
                }

                const width = 40 + (diskSize * (140 / this.numDisks));
                diskEl.style.width = `${width}px`;
                diskEl.style.background = this.colors[(diskSize - 1) % this.colors.length];
                diskEl.innerText = diskSize;

                diskContainer.appendChild(diskEl);
            });
        });
    }

    setupEvents() {
        this.pegEls.forEach((pegEl, index) => {
            pegEl.addEventListener('click', () => this.handlePegClick(index));
        });

        document.getElementById('reset-btn').addEventListener('click', () => this.reset());
        this.difficultySelect.addEventListener('change', () => this.reset());
        document.getElementById('play-again-btn').addEventListener('click', () => this.reset());

        // Ranking events
        this.submitScoreBtn.addEventListener('click', () => this.handleSubmitScore());
        this.closeRankingBtn.addEventListener('click', () => {
            this.rankingContainer.classList.add('hidden');
        });
    }

    handlePegClick(pegIndex) {
        const disks = this.pegs[pegIndex];

        if (this.selectedDisk === null) {
            if (disks.length > 0) {
                this.selectedDisk = disks[disks.length - 1];
                this.selectedPegIndex = pegIndex;
                this.render();
            }
        } else {
            if (pegIndex === this.selectedPegIndex) {
                this.selectedDisk = null;
                this.selectedPegIndex = null;
                this.render();
            } else {
                const targetDisks = this.pegs[pegIndex];
                if (targetDisks.length === 0 || targetDisks[targetDisks.length - 1] > this.selectedDisk) {
                    this.pegs[this.selectedPegIndex].pop();
                    this.pegs[pegIndex].push(this.selectedDisk);
                    this.moves++;
                    this.updateMoveCount();

                    this.selectedDisk = null;
                    this.selectedPegIndex = null;
                    this.render();
                    this.checkWin();
                } else {
                    this.flashMessage("ちいさい リングの うえには おけないよ！");
                }
            }
        }
    }

    updateMoveCount() {
        this.moveCountEl.textContent = this.moves;
    }

    flashMessage(msg) {
        const msgEl = document.getElementById('message');
        const originalText = "ぼうをえらんで リングを うごかそう";
        msgEl.textContent = msg;
        msgEl.style.color = '#ef4444';
        setTimeout(() => {
            msgEl.textContent = originalText;
            msgEl.style.color = '';
        }, 2000);
    }

    checkWin() {
        if (this.pegs[2].length === this.numDisks) {
            setTimeout(() => {
                this.finalMovesEl.textContent = this.moves;
                this.winScreen.classList.remove('hidden');

                if (this.bestMoves === '-' || this.moves < this.bestMoves) {
                    this.bestMoves = this.moves;
                    localStorage.setItem('hanoi-best', this.moves);
                    this.bestMovesEl.textContent = this.moves;
                }
            }, 300);
        }
    }

    async handleSubmitScore() {
        const name = this.playerNameInput.value.trim() || 'ななしさん';
        const scoreData = {
            name: name,
            moves: this.moves,
            numDisks: this.numDisks,
            timestamp: Date.now()
        };

        try {
            const scoresRef = ref(db, `rankings/${this.numDisks}`);
            const newScoreRef = push(scoresRef);
            await set(newScoreRef, scoreData);

            document.getElementById('ranking-input').classList.add('hidden');
            this.showRanking();
        } catch (error) {
            console.error("Error saving score:", error);
            alert("スコアの ほぞんに しっぱいしたよ...");
        }
    }

    showRanking() {
        const scoresRef = ref(db, `rankings/${this.numDisks}`);
        const topScoresQuery = query(scoresRef, orderByChild('moves'), limitToFirst(10));

        onValue(topScoresQuery, (snapshot) => {
            this.rankingList.innerHTML = '';
            const scores = [];
            snapshot.forEach((childSnapshot) => {
                scores.push(childSnapshot.val());
            });

            // Sort manually because orderByChild might need indexing or local sorting
            scores.sort((a, b) => a.moves - b.moves);

            scores.forEach((score, index) => {
                const li = document.createElement('li');
                li.className = `ranking-item rank-${index + 1}`;
                li.innerHTML = `
                    <div class="rank-badge">${index + 1}</div>
                    <div class="player-info">
                        <span class="player-name">${this.escapeHTML(score.name)}</span>
                    </div>
                    <div class="player-score">${score.moves}かい</div>
                `;
                this.rankingList.appendChild(li);
            });

            this.rankingContainer.classList.remove('hidden');
        });
    }

    escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}

// Initialize game
window.addEventListener('DOMContentLoaded', () => {
    new TowerOfHanoi();
});
