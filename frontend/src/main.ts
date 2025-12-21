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

// Render character grid for active tab
function renderCharacterGrid() {
    gridElement.innerHTML = '';
    
    const lowercase = activeTab;
    const uppercase = activeTab.toUpperCase();
    
    // Create sections for both lowercase and uppercase
    [lowercase, uppercase].forEach(baseChar => {
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
        
        variants.forEach((char) => {
            const button = document.createElement('button');
            button.className = 'char-button';
            button.textContent = char;
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

// Initialize
createTabs();
renderCharacterGrid();
