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
    this.handlePDFViewer();
  }

  scanForPuzzles() {
    const puzzleKeywords = [
      'crossword', 'sudoku', 'puzzle', 'riddle', 'word search', 
      'jumble', 'anagram', 'cryptic', 'clue', 'grid', 'number puzzle',
      'logic puzzle', 'brain teaser', 'math puzzle'
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

    this.scanForSudokuGrids();
  }

  scanForSudokuGrids() {
    const tables = document.querySelectorAll('table');
    const divs = document.querySelectorAll('div');
    
    tables.forEach(table => {
      const cells = table.querySelectorAll('td, th');
      if (cells.length >= 81) {
        const hasNumbers = Array.from(cells).some(cell => 
          /^[1-9]$/.test(cell.textContent.trim())
        );
        if (hasNumbers && !this.puzzles.includes(table)) {
          this.puzzles.push(table);
          this.highlightPuzzle(table, 'sudoku');
        }
      }
    });

    divs.forEach(div => {
      const text = div.textContent;
      if (text.match(/[1-9\s]{81,}/) && text.includes('1') && text.includes('9')) {
        if (!this.puzzles.includes(div)) {
          this.puzzles.push(div);
          this.highlightPuzzle(div, 'sudoku');
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

  highlightPuzzle(element, puzzleType = 'general') {
    const colors = {
      'sudoku': '#4ecdc4',
      'crossword': '#ff6b6b',
      'general': '#ff6b6b'
    };
    
    const color = colors[puzzleType] || colors.general;
    
    element.style.border = `2px solid ${color}`;
    element.style.borderRadius = '8px';
    element.style.padding = '10px';
    element.style.margin = '5px';
    element.style.backgroundColor = `${color}20`;
    
    element.addEventListener('click', () => {
      this.showHints(element, puzzleType);
    });
    
    element.style.cursor = 'pointer';
    element.title = `Click for ${puzzleType} hints!`;
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

  showHints(puzzleElement, puzzleType = 'general') {
    const puzzleText = puzzleElement.textContent.toLowerCase();
    const hints = this.generateHints(puzzleText, puzzleType);
    
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

  generateHints(puzzleText, puzzleType = 'general') {
    const hints = [];
    
    if (puzzleType === 'sudoku' || puzzleText.includes('sudoku')) {
      hints.push('🔢 Look for "naked singles" - numbers that can only go in one place');
      hints.push('✏️ Use pencil marks to track possible numbers in each cell');
      hints.push('📊 Focus on rows/columns with the most filled numbers first');
      hints.push('🎯 Remember: each number 1-9 must appear exactly once in each row, column, and 3x3 box');
      hints.push('🔍 Look for "hidden singles" - when a number can only go in one cell in a row/column/box');
      hints.push('📝 Try the "pointing pairs" technique for advanced solving');
      hints.push('🧠 If stuck, take a break and come back with fresh eyes');
    }
    
    if (puzzleText.includes('crossword')) {
      hints.push('🔤 Look for short words first - they often have fewer options');
      hints.push('🔗 Check for common prefixes like "un-", "re-", "in-"');
      hints.push('✂️ Use the crossing letters to narrow down possibilities');
      hints.push('📏 Start with the longest words - they\'re usually more specific');
    }
    
    if (puzzleText.includes('word search')) {
      hints.push('🔍 Look for the first letter of each word');
      hints.push('🔄 Words can be diagonal, backwards, or upside down');
      hints.push('⭕ Circle or highlight words as you find them');
      hints.push('📏 Start with the longest words - they\'re easier to spot');
    }
    
    if (puzzleText.includes('riddle') || puzzleText.includes('cryptic')) {
      hints.push('📖 Read the clue carefully - every word might be important');
      hints.push('🎭 Look for wordplay, puns, or hidden meanings');
      hints.push('🔨 Break down the clue into parts');
      hints.push('🧠 Think about synonyms and word associations');
    }
    
    if (puzzleText.includes('anagram')) {
      hints.push('✏️ Write down the letters and rearrange them');
      hints.push('🔤 Look for common word patterns');
      hints.push('🔤 Start with consonants or vowels');
      hints.push('✂️ Try breaking it into smaller parts');
    }
    
    if (hints.length === 0) {
      hints.push('😌 Take a deep breath and read the puzzle carefully');
      hints.push('🔨 Break it down into smaller parts');
      hints.push('⏰ Don\'t be afraid to take breaks');
      hints.push('💡 Sometimes the answer is simpler than you think');
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

  handlePDFViewer() {
    if (window.location.href.includes('chrome-extension://') || 
        window.location.href.includes('file://') ||
        document.querySelector('embed[type="application/pdf"]') ||
        document.querySelector('object[type="application/pdf"]')) {
      
      setTimeout(() => {
        this.scanForPuzzles();
        this.scanForSudokuGrids();
      }, 3000);
      
      setInterval(() => {
        this.scanForPuzzles();
      }, 5000);
    }
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