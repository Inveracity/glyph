import { CharacterService } from "../bindings/changeme";
import { Window } from "@wailsio/runtime";

// Character mappings organized by base character
const charMap: Record<string, string[]> = {
    'e': ['é', 'è', 'ê', 'ë', 'ē', 'ė', 'ę'],
    'E': ['É', 'È', 'Ê', 'Ë', 'Ē', 'Ė', 'Ę'],
    'a': ['á', 'à', 'â', 'ä', 'ã', 'å', 'ā'],
    'A': ['Á', 'À', 'Â', 'Ä', 'Ã', 'Å', 'Ā'],
    'i': ['í', 'ì', 'î', 'ï', 'ī', 'į', 'ı'],
    'I': ['Í', 'Ì', 'Î', 'Ï', 'Ī', 'Į', 'İ'],
    'o': ['ó', 'ò', 'ô', 'ö', 'õ', 'ō', 'ø'],
    'O': ['Ó', 'Ò', 'Ô', 'Ö', 'Õ', 'Ō', 'Ø'],
    'u': ['ú', 'ù', 'û', 'ü', 'ū', 'ų'],
    'U': ['Ú', 'Ù', 'Û', 'Ü', 'Ū', 'Ų'],
    'c': ['ç', 'ć', 'č'],
    'C': ['Ç', 'Ć', 'Č'],
    'n': ['ñ', 'ń'],
    'N': ['Ñ', 'Ń'],
    's': ['ś', 'š', 'ş'],
    'S': ['Ś', 'Š', 'Ş'],
    'y': ['ý', 'ÿ'],
    'Y': ['Ý', 'Ÿ'],
    'z': ['ź', 'ż', 'ž'],
    'Z': ['Ź', 'Ż', 'Ž'],
};

// Group lowercase and uppercase together
const letterGroups = ['e', 'a', 'i', 'o', 'u', 'c', 'n', 's', 'y', 'z'];

const tabsElement = document.getElementById('tabs')!;
const gridElement = document.getElementById('character-grid')!;
const notificationElement = document.getElementById('notification')!;
let activeTab = 'e';

// Create tabs
function createTabs() {
    letterGroups.forEach(letter => {
        const tab = document.createElement('button');
        tab.className = 'tab';
        tab.textContent = letter.toUpperCase();
        tab.dataset.letter = letter;
        
        if (letter === activeTab) {
            tab.classList.add('active');
        }
        
        tab.addEventListener('click', () => {
            setActiveTab(letter);
        });
        
        tabsElement.appendChild(tab);
    });
}

// Set active tab and update display
function setActiveTab(letter: string) {
    activeTab = letter;
    
    // Update tab styles
    const tabs = tabsElement.querySelectorAll('.tab');
    tabs.forEach(tab => {
        if ((tab as HTMLElement).dataset.letter === letter) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    // Update character grid
    renderCharacterGrid();
}

// Hotkey mappings for lowercase (numbers) and uppercase (QWERTY)
const lowercaseHotkeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
const uppercaseHotkeys = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];

// Render character grid for active tab
function renderCharacterGrid() {
    gridElement.innerHTML = '';
    
    const lowercase = activeTab;
    const uppercase = activeTab.toUpperCase();
    
    // Create sections for both lowercase and uppercase
    [lowercase, uppercase].forEach((baseChar, sectionIndex) => {
        const variants = charMap[baseChar];
        if (!variants) return;
        
        const section = document.createElement('div');
        section.className = 'char-section';
        
        const header = document.createElement('div');
        header.className = 'char-header';
        header.textContent = baseChar;
        section.appendChild(header);
        
        const variantsContainer = document.createElement('div');
        variantsContainer.className = 'char-variants';
        
        // Use appropriate hotkey set based on whether it's lowercase or uppercase
        const hotkeys = sectionIndex === 0 ? lowercaseHotkeys : uppercaseHotkeys;
        
        variants.forEach((char, index) => {
            const button = document.createElement('button');
            button.className = 'char-button';
            
            // Create container for character and hotkey
            const charText = document.createElement('span');
            charText.className = 'char-text';
            charText.textContent = char;
            button.appendChild(charText);
            
            // Add hotkey indicator if available
            if (index < hotkeys.length) {
                const hotkey = hotkeys[index];
                const hotkeyIndicator = document.createElement('span');
                hotkeyIndicator.className = 'char-hotkey';
                hotkeyIndicator.textContent = hotkey;
                button.appendChild(hotkeyIndicator);
                
                // Store hotkey on button for keyboard handling
                button.dataset.hotkey = hotkey;
            }
            
            button.dataset.char = char;
            button.addEventListener('click', () => typeCharacter(char));
            variantsContainer.appendChild(button);
        });
        
        section.appendChild(variantsContainer);
        gridElement.appendChild(section);
    });
}

// Type character and hide window
async function typeCharacter(char: string) {
    try {
        // Hide window first so typing happens in the original application
        Window.Hide();
        
        // Type the character
        await CharacterService.TypeCharacter(char);
    } catch (err) {
        console.error('Failed to type character:', err);
        showNotification('Failed to type character', true);
    }
}

// Show notification
function showNotification(message: string, isError = false) {
    notificationElement.textContent = message;
    notificationElement.className = `notification show ${isError ? 'error' : ''}`;
    
    setTimeout(() => {
        notificationElement.className = 'notification';
    }, 2000);
}

// Add keyboard shortcuts
document.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    
    // Check if the pressed key corresponds to one of our tabs
    if (letterGroups.includes(key)) {
        event.preventDefault();
        setActiveTab(key);
        return;
    }
    
    // Check if the pressed key corresponds to a character hotkey
    const charButtons = gridElement.querySelectorAll('.char-button');
    charButtons.forEach(button => {
        const hotkey = (button as HTMLElement).dataset.hotkey;
        if (hotkey && hotkey === key) {
            event.preventDefault();
            const char = (button as HTMLElement).dataset.char;
            if (char) {
                typeCharacter(char);
            }
        }
    });
});

// Initialize
createTabs();
renderCharacterGrid();
