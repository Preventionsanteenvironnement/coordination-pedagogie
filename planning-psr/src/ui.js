// Pont UI : expose une API unique (Preact + htm) au reste de l'application.
// Permet d'écrire des composants avec une syntaxe proche du JSX, sans étape de build.
import { h, render, Fragment } from 'preact';
import { useState, useEffect, useMemo, useRef, useCallback, useReducer } from 'preact/hooks';
import htm from 'htm';

export const html = htm.bind(h);
export { h, render, Fragment, useState, useEffect, useMemo, useRef, useCallback, useReducer };
