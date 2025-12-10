
import type { Mod, Author } from './types';
import { modsFromDirectory, authorsFromDirectory } from './modDirectory';

export const authors: Author[] = authorsFromDirectory;

export const mods: Mod[] = modsFromDirectory;
