/**
 * Tower of Hanoi Game Logic
 */

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
    }

    render() {
        this.pegs.forEach((disks, pegIdx) => {
            const diskContainer = this.pegEls[pegIdx].querySelector('.disks');
            diskContainer.innerHTML = '';

            disks.forEach((diskSize, idx) => {
                const diskEl = document.createElement('div');
                diskEl.className = 'disk';

                // Only mark as selected if it's the exact disk and on the correct peg
                if (this.selectedDisk === diskSize &&
                    this.selectedPegIndex === pegIdx &&
                    idx === disks.length - 1) {
                    diskEl.classList.add('selected');
                }

                // Scale width based on disk size (min 40px, max 180px)
                const width = 40 + (diskSize * (140 / this.numDisks));
                diskEl.style.width = `${width}px`;
                diskEl.style.background = this.colors[(diskSize - 1) % this.colors.length];
                diskEl.dataset.size = diskSize;

                diskContainer.appendChild(diskEl);
            });
        });
    }

    setupEvents() {
        console.log("Setting up events for pegs:", this.pegEls);
        this.pegEls.forEach((pegEl, index) => {
            pegEl.addEventListener('click', (e) => {
                console.log(`Peg ${index} clicked`, e.target);
                this.handlePegClick(index);
            });
        });

        document.getElementById('reset-btn').addEventListener('click', () => {
            console.log("Reset button clicked");
            this.reset();
        });

        this.difficultySelect.addEventListener('change', () => {
            console.log("Difficulty changed to:", this.difficultySelect.value);
            this.reset();
        });

        document.getElementById('play-again-btn').addEventListener('click', () => {
            console.log("Play again clicked");
            this.reset();
        });
    }

    handlePegClick(pegIndex) {
        const disks = this.pegs[pegIndex];

        if (this.selectedDisk === null) {
            // Selecting a disk
            if (disks.length > 0) {
                // IMPORTANT: We need to store the disk itself to identify it in render()
                // and its source peg to know where it came from.
                this.selectedDisk = disks[disks.length - 1];
                this.selectedPegIndex = pegIndex;
                this.render();
            }
        } else {
            // A disk is already selected, let's try to move it
            if (pegIndex === this.selectedPegIndex) {
                // Clicked the same peg -> Deselect
                this.selectedDisk = null;
                this.selectedPegIndex = null;
                this.render();
            } else {
                // Check if move is valid
                const targetDisks = this.pegs[pegIndex];
                if (targetDisks.length === 0 || targetDisks[targetDisks.length - 1] > this.selectedDisk) {
                    // Valid move
                    this.pegs[this.selectedPegIndex].pop();
                    this.pegs[pegIndex].push(this.selectedDisk);
                    this.moves++;
                    this.updateMoveCount();

                    this.selectedDisk = null;
                    this.selectedPegIndex = null;
                    this.render();
                    this.checkWin();
                } else {
                    // Invalid move
                    this.flashMessage("ちいさい リングの うえには おけないよ！");
                    // Don't deselect, let user try another peg
                    // But we can render to update the selected state if needed
                    // Actually, keeping the selection is better UX
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
        // Win if all disks are on the last peg
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
}

// Initialize game
window.addEventListener('DOMContentLoaded', () => {
    new TowerOfHanoi();
});
