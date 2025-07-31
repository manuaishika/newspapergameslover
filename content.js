class PuzzleDetector {
  constructor() {
    this.puzzles = [];
    this.hintPanel = null;
    this.isActive = true;
    this.init();
  }

  init() {
    this.scanForPuzzles();
    this.createHintPanel();
    this.observePageChanges();
  }

  scanForPuzzles() {
    const puzzleKeywords = [
      'crossword', 'sudoku', 'puzzle', 'riddle', 'word search', 
      'jumble', 'anagram', 'cryptic', 'clue', 'grid'
    ];

    const textNodes = this.getAllTextNodes(document.body);
    
    textNodes.forEach(node => {
      const text = node.textContent.toLowerCase();
      const isPuzzle = puzzleKeywords.some(keyword => text.includes(keyword));
      
      if (isPuzzle) {
        const puzzleElement = this.findPuzzleContainer(node);
        if (puzzleElement && !this.puzzles.includes(puzzleElement)) {
          this.puzzles.push(puzzleElement);
          this.highlightPuzzle(puzzleElement);
        }
      }
    });
  }

  getAllTextNodes(element) {
    const textNodes = [];
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let node;
    while (node = walker.nextNode()) {
      if (node.textContent.trim().length > 10) {
        textNodes.push(node);
      }
    }
    return textNodes;
  }

  findPuzzleContainer(node) {
    let element = node.parentElement;
    while (element && element !== document.body) {
      if (element.tagName === 'DIV' || element.tagName === 'ARTICLE' || element.tagName === 'SECTION') {
        return element;
      }
      element = element.parentElement;
    }
    return node.parentElement;
  }

  highlightPuzzle(element) {
    element.style.border = '2px solid #ff6b6b';
    element.style.borderRadius = '8px';
    element.style.padding = '10px';
    element.style.margin = '5px';
    element.style.backgroundColor = 'rgba(255, 107, 107, 0.1)';
    
    element.addEventListener('click', () => {
      this.showHints(element);
    });
    
    element.style.cursor = 'pointer';
    element.title = 'Click for puzzle hints!';
  }

  createHintPanel() {
    this.hintPanel = document.createElement('div');
    this.hintPanel.id = 'puzzle-hint-panel';
    this.hintPanel.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 300px;
      max-height: 400px;
      background: white;
      border: 2px solid #4ecdc4;
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      z-index: 10000;
      padding: 15px;
      font-family: Arial, sans-serif;
      display: none;
      overflow-y: auto;
    `;
    
    document.body.appendChild(this.hintPanel);
  }

  showHints(puzzleElement) {
    const puzzleText = puzzleElement.textContent.toLowerCase();
    const hints = this.generateHints(puzzleText);
    
    this.hintPanel.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <h3 style="margin: 0; color: #2c3e50;">🧩 Puzzle Hints</h3>
        <button id="close-hints" style="background: #e74c3c; color: white; border: none; border-radius: 5px; padding: 5px 10px; cursor: pointer;">×</button>
      </div>
      <div style="color: #34495e; line-height: 1.5;">
        ${hints.map(hint => `<p style="margin: 8px 0;">💡 ${hint}</p>`).join('')}
      </div>
    `;
    
    this.hintPanel.style.display = 'block';
    
    document.getElementById('close-hints').addEventListener('click', () => {
      this.hintPanel.style.display = 'none';
    });
  }

  generateHints(puzzleText) {
    const hints = [];
    
    if (puzzleText.includes('crossword')) {
      hints.push('Look for short words first - they often have fewer options');
      hints.push('Check for common prefixes like "un-", "re-", "in-"');
      hints.push('Use the crossing letters to narrow down possibilities');
      hints.push('Start with the longest words - they\'re usually more specific');
    }
    
    if (puzzleText.includes('sudoku')) {
      hints.push('Look for numbers that can only go in one place');
      hints.push('Use the "pencil mark" technique to track possibilities');
      hints.push('Focus on rows/columns with the most filled numbers');
      hints.push('Remember: each number 1-9 must appear exactly once in each row, column, and box');
    }
    
    if (puzzleText.includes('word search')) {
      hints.push('Look for the first letter of each word');
      hints.push('Words can be diagonal, backwards, or upside down');
      hints.push('Circle or highlight words as you find them');
      hints.push('Start with the longest words - they\'re easier to spot');
    }
    
    if (puzzleText.includes('riddle') || puzzleText.includes('cryptic')) {
      hints.push('Read the clue carefully - every word might be important');
      hints.push('Look for wordplay, puns, or hidden meanings');
      hints.push('Break down the clue into parts');
      hints.push('Think about synonyms and word associations');
    }
    
    if (puzzleText.includes('anagram')) {
      hints.push('Write down the letters and rearrange them');
      hints.push('Look for common word patterns');
      hints.push('Start with consonants or vowels');
      hints.push('Try breaking it into smaller parts');
    }
    
    if (hints.length === 0) {
      hints.push('Take a deep breath and read the puzzle carefully');
      hints.push('Break it down into smaller parts');
      hints.push('Don\'t be afraid to take breaks');
      hints.push('Sometimes the answer is simpler than you think');
    }
    
    return hints;
  }

  observePageChanges() {
    const observer = new MutationObserver(() => {
      setTimeout(() => {
        this.scanForPuzzles();
      }, 1000);
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  handleMessage(request, sender, sendResponse) {
    switch(request.action) {
      case 'scanPuzzles':
        this.scanForPuzzles();
        sendResponse({success: true, count: this.puzzles.length});
        break;
        
      case 'toggleHints':
        this.isActive = !this.isActive;
        if (this.isActive) {
          this.puzzles.forEach(puzzle => {
            puzzle.style.display = 'block';
          });
        } else {
          this.puzzles.forEach(puzzle => {
            puzzle.style.display = 'none';
          });
        }
        sendResponse({success: true, active: this.isActive});
        break;
        
      case 'getStatus':
        sendResponse({puzzlesFound: this.puzzles.length});
        break;
        
      case 'quickScan':
        this.scanForPuzzles();
        break;
        
      case 'pageLoaded':
        setTimeout(() => this.scanForPuzzles(), 2000);
        break;
    }
  }
}

let detector;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    detector = new PuzzleDetector();
  });
} else {
  detector = new PuzzleDetector();
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (detector) {
    detector.handleMessage(request, sender, sendResponse);
  }
  return true;
}); 