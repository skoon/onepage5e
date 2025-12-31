import { GoogleGenAI, Chat } from "@google/genai";
import { Character, ChatMessage } from "../types";
import { getModifier, getProficiencyBonus, ARCHETYPE_INFO } from "../constants";

const getSystemPrompt = (character: Character, setting: string, goal: string, additionalNotes: string) => {
  const archetype = character.archetype ? ARCHETYPE_INFO[character.archetype] : null;
  const modStr = getModifier(character.abilities.STR);
  const modDex = getModifier(character.abilities.DEX);
  const modCon = getModifier(character.abilities.CON);
  const modInt = getModifier(character.abilities.INT);
  const modWis = getModifier(character.abilities.WIS);
  const modChr = getModifier(character.abilities.CHR);
  const prof = getProficiencyBonus(character.level);

  return `
You are a Dungeon Master running a minimalist fantasy roleplaying game called "One Page 5e".
Your goal is to guide the player through an adventure based on their input and dice rolls.

**Game Rules:**
- **Rolls:** d20 + Ability Modifier.
- **Difficulty:** Simple (5+), Easy (10+), Difficult (15+), Hard (20+).
- **Combat:** Initiative = Dex Mod. Attack = d20 + Mod. Damage = Weapon Die.
- **Magic:** Wizards roll INT or WIS to cast. Difficulty set by you based on situation.

**The Player Character:**
- **Name:** ${character.name}
- **Level:** ${character.level}
- **Class/Archetype:** ${character.archetype} (${archetype?.label})
- **Stats:**
  - STR: ${character.abilities.STR} (${modStr >= 0 ? '+' : ''}${modStr})
  - DEX: ${character.abilities.DEX} (${modDex >= 0 ? '+' : ''}${modDex})
  - CON: ${character.abilities.CON} (${modCon >= 0 ? '+' : ''}${modCon})
  - INT: ${character.abilities.INT} (${modInt >= 0 ? '+' : ''}${modInt})
  - WIS: ${character.abilities.WIS} (${modWis >= 0 ? '+' : ''}${modWis})
  - CHR: ${character.abilities.CHR} (${modChr >= 0 ? '+' : ''}${modChr})
- **HP:** ${character.currentHp}/${character.maxHp}
- **Proficiency Bonus:** +${prof}
- **Equipment:** ${character.weapons.map(w => w.name).join(', ')}, ${character.armor?.name}
- **Spells:** ${character.knownSpells.map(s => s.name).join(', ')}

**Adventure Setup:**
- **Setting:** ${setting || "Fantasy World"}
- **Goal:** ${goal || "Explore and survive"}
- **Notes/Scenario:** ${additionalNotes}

**Instructions:**
1. Act as the narrator and DM. Describe surroundings, NPCs, and events.
2. Begin by introducing the player to the setting and their immediate situation relevant to the goal.
3. Ask the player for actions.
4. When the outcome is uncertain, ask the player to roll specific dice (e.g., "Roll a Strength check" or "Roll for Initiative").
5. Interpret the user's dice results.
6. Keep descriptions evocative but concise.
7. Manage combat turns if fighting occurs.
`;
};

let chatSession: Chat | null = null;
let aiInstance: GoogleGenAI | null = null;

export const initGame = async (character: Character, setting: string, goal: string, additionalNotes: string) => {
  if (!process.env.API_KEY) {
    console.error("API Key missing");
    return;
  }
  
  aiInstance = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  chatSession = aiInstance.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: getSystemPrompt(character, setting, goal, additionalNotes),
      temperature: 0.9,
    },
  });

  // Initial message to start the story
  try {
    const response = await chatSession.sendMessage({
      message: "Begin the adventure."
    });
    return response.text;
  } catch (error) {
    console.error("Error starting game:", error);
    return "The mists of Ravenloft... err, the adventure fails to load. (API Error)";
  }
};

export const sendMessage = async (message: string): Promise<string> => {
  if (!chatSession) {
    return "Error: Game session not initialized.";
  }

  try {
    const response = await chatSession.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Error sending message:", error);
    return "The spirits are silent. (API Error)";
  }
};

export const generateCharacterPortrait = async (prompt: string): Promise<string | null> => {
  if (!process.env.API_KEY) {
    console.error("API Key missing");
    return null;
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating portrait:", error);
    return null;
  }
};