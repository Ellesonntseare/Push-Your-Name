const APJS = globalThis.orion['@orion/orion-sdk/EditorFramework'].APJS;

const {BasicScriptNode} = require('../BasicScriptNode');
const {
  customNode,
  component,
  input,
  output,
  serializeSceneObjectFlag,
  serializeProperty,
  label, readOnly, slider, spinBox, dropDown,
  textArea, header, showIf, tooltip, separator,
  space, groupBegin, groupEnd, disablePin,
} = require('../OrionDecorators');

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PushNameController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushNameController = void 0;
let PushNameController = PushNameController_1 = class PushNameController extends APJS.BasicScriptComponent {
    constructor() {
        super(...arguments);
        this.gestureAngle = 13;
        this.neutralAngle = 6;
        this.timeScale = 1;
        this.firstName = 0;
        this.cells = [];
        this.blocks = [];
        this.letters = [];
        this.goals = [];
        this.goalLabels = [];
        this.confetti = [];
        this.confettiST = [];
        this.confettiBase = [];
        this.partyTime = 0;
        this.levels = [];
        this.index = 0;
        this.phase = 0;
        this.resumePhase = 0;
        this.recording = false;
        this.paused = false;
        this.seconds = 60;
        this.remaining = 60;
        this.count = 3;
        this.px = 0;
        this.py = 0;
        this.tiles = [];
        this.history = [];
        this.moves = 0;
        this.cellPos = [];
        this.cellImages = [];
        this.blockST = [];
        this.blockImages = [];
        this.letterTexts = [];
        this.goalST = [];
        this.goalTexts = [];
        this.btns = [];
        this.rollBase = 0;
        this.pitchBase = 0;
        this.rollSum = 0;
        this.pitchSum = 0;
        this.samples = 0;
        this.calTime = 0;
        this.sx = 0;
        this.sy = 0;
        this.armed = false;
        this.hadFace = false;
        this.lastSecond = -1;
        this.pulse = 0;
        this.rejected = 0;
        this.poseClock = 0;
        this.onRecordStart = (_e) => {
            this.recording = true;
            if (this.paused) {
                this.phase = this.resumePhase;
                this.paused = false;
                this.armed = false;
                this.setStatus(this.phase === 3 ? 'Return to centre — recording resumed' : 'Recording resumed — get ready');
                this.show();
                console.log('PN RESUME ' + this.remaining.toFixed(2));
            }
            else {
                this.reset();
                this.begin();
                console.log('PN RECORD START');
            }
        };
        this.onRecordEnd = (_e) => {
            this.recording = false;
            if (this.phase >= 1 && this.phase <= 3) {
                this.resumePhase = this.phase;
                this.phase = 6;
                this.paused = true;
                this.setStatus('Recording paused — continue to resume');
                this.show();
                console.log('PN PAUSE ' + this.remaining.toFixed(2));
            }
        };
        this.onTouch = (e) => {
            const t = e.args[0];
            if (t.phase !== APJS.TouchPhase.Began)
                return;
            const hit = (i) => APJS.TouchUtils.isScreenPointOnImage(t.position, this.btns[i]);
            if (this.phase === 0 && hit(0)) {
                this.begin();
                return;
            }
            if ((this.phase === 4 || this.phase === 5) && hit(1)) {
                this.reset();
                this.begin();
                return;
            }
            if (this.phase === 3 && hit(2)) {
                this.undo();
                return;
            }
            if (hit(3)) {
                this.reset();
                this.begin();
                return;
            }
            if (hit(4)) {
                this.index = (this.index + 1) % 6;
                this.reset();
                this.click.play();
                console.log('PN NAME ' + this.levels[this.index].name);
            }
        };
    }
    onStart() {
        const raw = this.data.json;
        const expected = ['SERAME', 'MAJORO', 'NTSEARE', 'RORISANG', 'MATHAPELO', 'LEPHUTING'];
        if (!raw || raw.schemaVersion !== 1 || !raw.levels || raw.levels.length !== 6)
            throw new Error('Push Your Name: invalid puzzle data');
        this.levels = raw.levels;
        for (let i = 0; i < 6; i++) {
            const l = this.levels[i];
            if (l.name !== expected[i] || l.width !== 8 || l.height !== 8 || l.blocks.length !== l.name.length || l.goals.length !== l.name.length || l.seconds < 10)
                throw new Error('Invalid fixed name or board ' + i);
            for (const b of l.blocks)
                if (b.x < 1 || b.x > 6 || b.y < 1 || b.y > 6 || b.letter.length !== 1)
                    throw new Error('Invalid block in ' + l.name);
        }
        if (this.cells.length !== 64 || this.blocks.length !== 9 || this.letters.length !== 9 || this.goals.length !== 9)
            throw new Error('Push Your Name: missing scene array wiring');
        for (const c of this.cells) {
            const s = c.getComponent('ScreenTransform');
            const v = s.anchoredPosition;
            this.cellPos.push(new APJS.Vector2f(v.x, v.y));
            this.cellImages.push(c.getComponent('Image'));
        }
        for (let i = 0; i < 9; i++) {
            this.blockST.push(this.blocks[i].getComponent('ScreenTransform'));
            this.blockImages.push(this.blocks[i].getComponent('Image'));
            this.letterTexts.push(this.letters[i].getComponent('Text'));
            this.goalST.push(this.goals[i].getComponent('ScreenTransform'));
            this.goalTexts.push(this.goalLabels[i].getComponent('Text'));
        }
        this.pusherST = this.pusher.getComponent('ScreenTransform');
        this.pusherImage = this.pusher.getComponent('Image');
        this.aimST = this.aimDot.getComponent('ScreenTransform');
        const origin = this.aimST.anchoredPosition;
        this.aimOrigin = new APJS.Vector2f(origin.x, origin.y);
        this.timer = this.timeText.getComponent('Text');
        this.nameLabel = this.nameText.getComponent('Text');
        this.moveLabel = this.movesText.getComponent('Text');
        this.placedLabel = this.placedText.getComponent('Text');
        this.status = this.stateText.getComponent('Text');
        this.countLabel = this.countText.getComponent('Text');
        this.verdict = this.resultTitle.getComponent('Text');
        this.detail = this.resultDetail.getComponent('Text');
        this.click = this.sound.getComponent('AudioComponent');
        for (const b of [this.startBtn, this.retryBtn, this.undoBtn, this.restartBtn, this.nextBtn])
            this.btns.push(b.getComponent('Image'));
        this.gestureAngle = Math.max(8, Math.min(22, this.gestureAngle));
        this.neutralAngle = Math.max(3, Math.min(9, this.neutralAngle));
        this.timeScale = Math.max(0.5, Math.min(2, this.timeScale));
        this.index = Math.max(0, Math.min(5, Math.round(this.firstName)));
        for (const c of this.confetti) {
            const st = c.getComponent('ScreenTransform');
            this.confettiST.push(st);
            const p = st.anchoredPosition;
            this.confettiBase.push(new APJS.Vector2f(p.x, p.y));
        }
        this.reset();
        const emit = APJS.EventManager.getGlobalEmitter();
        emit.on(APJS.EventType.Touch, this.onTouch);
        emit.on(APJS.EventType.RecordStart, this.onRecordStart);
        emit.on(APJS.EventType.RecordEnd, this.onRecordEnd);
        console.log('PN READY ' + this.levels[this.index].name + ' cells=' + this.cells.length);
    }
    onDestroy() { const e = APJS.EventManager.getGlobalEmitter(); e.off(APJS.EventType.Touch, this.onTouch); e.off(APJS.EventType.RecordStart, this.onRecordStart); e.off(APJS.EventType.RecordEnd, this.onRecordEnd); }
    copyBlocks() { return this.tiles.map(b => ({ x: b.x, y: b.y, letter: b.letter })); }
    reset() {
        const l = this.levels[this.index];
        this.tiles = l.blocks.map(b => ({ x: b.x, y: b.y, letter: b.letter }));
        this.px = l.player.x;
        this.py = l.player.y;
        this.partyTime = 0;
        this.moves = 0;
        this.history = [];
        this.seconds = l.seconds * this.timeScale;
        this.remaining = this.seconds;
        this.phase = 0;
        this.paused = false;
        this.count = 3;
        this.calTime = 0;
        this.samples = 0;
        this.rollSum = 0;
        this.pitchSum = 0;
        this.sx = 0;
        this.sy = 0;
        this.hadFace = false;
        this.armed = false;
        this.pulse = 0;
        this.rejected = 0;
        this.lastSecond = -1;
        this.nameLabel.text = l.name;
        this.setStatus('Press PLAY or start recording');
        this.draw(true);
        this.show();
    }
    begin() { this.phase = 1; this.calTime = 0; this.samples = 0; this.rollSum = 0; this.pitchSum = 0; this.show(); this.setStatus('Hold your head centred for one second'); this.click.play(); console.log('PN CALIBRATE'); }
    show() { this.party.setEnabledInHierarchy(this.phase === 4); this.intro.setEnabledInHierarchy(this.phase === 0); this.result.setEnabledInHierarchy(this.phase === 4 || this.phase === 5); this.countdown.setEnabledInHierarchy(this.phase === 2); }
    setStatus(s) { if (this.status.text !== s)
        this.status.text = s; }
    free(x, y) { return x > 0 && x < 7 && y > 0 && y < 7 && !this.levels[this.index].walls.some(w => w[0] === x && w[1] === y); }
    at(x, y) { return this.tiles.findIndex(b => b.x === x && b.y === y); }
    placed() { let n = 0; for (const g of this.levels[this.index].goals) {
        const i = this.at(g.x, g.y);
        if (i >= 0 && this.tiles[i].letter === g.letter)
            n++;
    } return n; }
    move(d) {
        if (this.phase !== 3)
            return false;
        const dx = PushNameController_1.DX[d], dy = PushNameController_1.DY[d], x = this.px + dx, y = this.py + dy, b = this.at(x, y);
        if (!this.free(x, y) || (b >= 0 && (!this.free(x + dx, y + dy) || this.at(x + dx, y + dy) >= 0))) {
            this.rejected = 0.22;
            this.setStatus('Blocked — find another route');
            console.log('PN BLOCKED');
            return false;
        }
        this.history.push({ x: this.px, y: this.py, blocks: this.copyBlocks(), moves: this.moves });
        if (b >= 0) {
            this.tiles[b].x += dx;
            this.tiles[b].y += dy;
        }
        this.px = x;
        this.py = y;
        this.moves++;
        this.pulse = 0.18;
        this.click.play();
        this.draw(false);
        this.setStatus('Return to centre for the next move');
        console.log('PN MOVE ' + d + ' ' + this.px + ',' + this.py + ' moves=' + this.moves);
        if (this.placed() === this.levels[this.index].goals.length)
            this.finish(true);
        return true;
    }
    undo() { if (!this.history.length)
        return; const h = this.history.pop(); this.px = h.x; this.py = h.y; this.tiles = h.blocks; this.moves = h.moves; this.draw(false); this.click.play(); this.setStatus('Move undone — time keeps running'); console.log('PN UNDO'); }
    finish(won) { this.phase = won ? 4 : 5; this.partyTime = won ? 1.8 : 0; this.show(); this.verdict.text = won ? 'NAME COMPLETE!' : 'TIME’S UP!'; this.verdict.color = won ? new APJS.Color(1, 0.84, 0.4, 1) : new APJS.Color(1, 0.5, 0.6, 1); this.detail.text = this.levels[this.index].name + '\n' + (won ? (this.seconds - this.remaining).toFixed(1) + 's · ' + this.moves + ' moves' : this.placed() + ' / ' + this.tiles.length + ' letters placed'); this.setStatus('Try again or choose the next name'); this.pulse = won ? 0.7 : 0; console.log('PN RESULT ' + (won ? 'WON' : 'LOST') + ' ' + this.levels[this.index].name); }
    pos(x, y) { return this.cellPos[y * 8 + x]; }
    draw(snap) {
        const l = this.levels[this.index];
        for (let i = 0; i < 64; i++)
            this.cellImages[i].color = this.free(i % 8, Math.floor(i / 8)) ? new APJS.Color(0.49, 0.26, 0.72, 1) : new APJS.Color(0.15, 0.07, 0.24, 1);
        for (let i = 0; i < 9; i++) {
            const g = l.goals[i], b = this.tiles[i];
            this.goals[i].setEnabledInHierarchy(!!g);
            this.blocks[i].setEnabledInHierarchy(!!b);
            if (g) {
                this.goalST[i].anchoredPosition = this.pos(g.x, g.y);
                this.goalTexts[i].text = g.letter;
            }
            if (b) {
                if (snap)
                    this.blockST[i].anchoredPosition = this.pos(b.x, b.y);
                this.letterTexts[i].text = b.letter;
                const correct = l.goals.some(t => t.x === b.x && t.y === b.y && t.letter === b.letter);
                const palette = [new APJS.Color(1, 0.45, 0.53, 1), new APJS.Color(1, 0.78, 0.27, 1), new APJS.Color(0.35, 0.72, 1, 1)];
                this.blockImages[i].color = correct ? new APJS.Color(0.32, 1, 0.69, 1) : palette[i % 3];
            }
        }
        this.targetPlayer = this.pos(this.px, this.py);
        if (snap)
            this.pusherST.anchoredPosition = this.targetPlayer;
        this.moveLabel.text = this.moves + ' moves';
        this.placedLabel.text = this.placed() + ' / ' + l.goals.length;
        this.updateTimer();
    }
    updateTimer() { const s = Math.ceil(this.remaining); if (s !== this.lastSecond) {
        this.lastSecond = s;
        this.timer.text = s + 's';
        this.timer.color = s <= 10 ? new APJS.Color(1, 0.3, 0.45, 1) : new APJS.Color(0.65, 1, 0.83, 1);
    } }
    onUpdate(dt) {
        if (!this.levels.length)
            return;
        const result = APJS.AlgorithmManager.getResult();
        const hasFace = result.getFaceCount() > 0;
        if (hasFace) {
            if (!this.hadFace && this.phase === 3)
                this.setStatus('Face found — return to centre');
            const face = result.getFaceBaseInfo(0);
            const roll = face.roll * 180 / Math.PI, pitch = face.pitch * 180 / Math.PI;
            if (this.phase === 1) {
                this.rollSum += roll;
                this.pitchSum += pitch;
                this.samples++;
                this.calTime += dt;
                if (this.calTime >= 1) {
                    this.rollBase = this.rollSum / this.samples;
                    this.pitchBase = this.pitchSum / this.samples;
                    this.sx = 0;
                    this.sy = 0;
                    this.phase = 2;
                    this.count = 3;
                    this.countLabel.text = '3';
                    this.show();
                    this.setStatus('Get ready — return to centre');
                    console.log('PN COUNTDOWN');
                }
            }
            else {
                const a = 1 - Math.exp(-18 * dt);
                this.sx += a * (-(roll - this.rollBase) - this.sx);
                this.sy += a * (pitch - this.pitchBase - this.sy);
                this.aimST.anchoredPosition = new APJS.Vector2f(this.aimOrigin.x + Math.max(-25, Math.min(25, this.sx)) * 2, this.aimOrigin.y - Math.max(-25, Math.min(25, this.sy)) * 1.7);
                if (Math.abs(this.sx) < this.neutralAngle && Math.abs(this.sy) < this.neutralAngle)
                    this.armed = true;
                if (this.phase === 3 && this.armed && Math.max(Math.abs(this.sx), Math.abs(this.sy)) >= this.gestureAngle) {
                    this.armed = false;
                    const d = Math.abs(this.sx) > Math.abs(this.sy) ? (this.sx > 0 ? 1 : 3) : (this.sy > 0 ? 2 : 0);
                    this.move(d);
                }
            }
            this.hadFace = true;
        }
        else {
            this.armed = false;
            this.hadFace = false;
            if (this.phase === 1) {
                this.samples = 0;
                this.calTime = 0;
                this.rollSum = 0;
                this.pitchSum = 0;
            }
            if (this.phase >= 1 && this.phase <= 3)
                this.setStatus('Find your face — return to centre');
        }
        if (this.phase === 2) {
            this.count -= dt;
            const shown = String(Math.max(1, Math.ceil(this.count)));
            if (this.countLabel.text !== shown)
                this.countLabel.text = shown;
            if (this.count <= 0) {
                this.phase = 3;
                this.show();
                this.armed = false;
                this.setStatus('Tilt to move — push the letters');
                console.log('PN PLAY ' + this.levels[this.index].name);
            }
        }
        if (this.phase === 3) {
            this.remaining = Math.max(0, this.remaining - dt);
            this.updateTimer();
            if (this.remaining <= 0)
                this.finish(false);
        }
        if (this.phase === 4 && this.partyTime > 0) {
            this.partyTime = Math.max(0, this.partyTime - dt);
            const t = 1.8 - this.partyTime;
            for (let i = 0; i < this.confettiST.length; i++) {
                const base = this.confettiBase[i];
                this.confettiST[i].anchoredPosition = new APJS.Vector2f(base.x + Math.sin(t * 3 + i) * 20, base.y - t * (90 + (i % 5) * 20));
                this.confettiST[i].rotation += dt * (80 + i * 9);
            }
            if (this.partyTime === 0)
                this.party.setEnabledInHierarchy(false);
        }
        const lerp = 1 - Math.exp(-20 * dt);
        for (let i = 0; i < this.tiles.length; i++) {
            const t = this.pos(this.tiles[i].x, this.tiles[i].y), v = this.blockST[i].anchoredPosition;
            this.blockST[i].anchoredPosition = new APJS.Vector2f(v.x + (t.x - v.x) * lerp, v.y + (t.y - v.y) * lerp);
        }
        const v = this.pusherST.anchoredPosition;
        this.pusherST.anchoredPosition = new APJS.Vector2f(v.x + (this.targetPlayer.x - v.x) * lerp, v.y + (this.targetPlayer.y - v.y) * lerp);
        if (this.pulse > 0) {
            this.pulse = Math.max(0, this.pulse - dt);
            const s = 1 + Math.sin(this.pulse * 18) * 0.12;
            this.pusherST.scale = new APJS.Vector2f(s, s);
        }
        else
            this.pusherST.scale = new APJS.Vector2f(1, 1);
        if (this.rejected > 0) {
            this.rejected = Math.max(0, this.rejected - dt);
            this.pusherImage.color = new APJS.Color(1, 0.5, 0.5, 1);
        }
        else
            this.pusherImage.color = new APJS.Color(1, 1, 1, 1);
    }
};
PushNameController.DX = [0, 1, 0, -1];
PushNameController.DY = [-1, 0, 1, 0];
__decorate([
    header('Theme & Assets'),
    serializeProperty(),
    tooltip('The six fixed name puzzles and verified layouts.')
], PushNameController.prototype, "data", void 0);
__decorate([
    header('Gameplay Tuning'),
    serializeProperty(),
    slider(8, 22, 1),
    tooltip('Head gesture angle in degrees. Lower is easier.')
], PushNameController.prototype, "gestureAngle", void 0);
__decorate([
    serializeProperty(),
    slider(3, 9, 1),
    tooltip('Return within this many degrees of centre to make another move.')
], PushNameController.prototype, "neutralAngle", void 0);
__decorate([
    serializeProperty(),
    slider(0.5, 2, 0.1),
    tooltip('Multiply the authored time limits. One uses the standard challenge limits.')
], PushNameController.prototype, "timeScale", void 0);
__decorate([
    serializeProperty(),
    slider(0, 5, 1),
    tooltip('First puzzle index: SERAME, MAJORO, NTSEARE, RORISANG, MATHAPELO, LEPHUTING.')
], PushNameController.prototype, "firstName", void 0);
__decorate([
    serializeSceneObjectFlag,
    header('Advanced — Scene Wiring'),
    serializeProperty()
], PushNameController.prototype, "cells", void 0);
__decorate([
    serializeSceneObjectFlag,
    serializeProperty()
], PushNameController.prototype, "blocks", void 0);
__decorate([
    serializeSceneObjectFlag,
    serializeProperty()
], PushNameController.prototype, "letters", void 0);
__decorate([
    serializeSceneObjectFlag,
    serializeProperty()
], PushNameController.prototype, "goals", void 0);
__decorate([
    serializeSceneObjectFlag,
    serializeProperty()
], PushNameController.prototype, "goalLabels", void 0);
__decorate([
    serializeSceneObjectFlag,
    serializeProperty()
], PushNameController.prototype, "pusher", void 0);
__decorate([
    serializeSceneObjectFlag,
    serializeProperty()
], PushNameController.prototype, "aimDot", void 0);
__decorate([
    serializeSceneObjectFlag,
    serializeProperty()
], PushNameController.prototype, "intro", void 0);
__decorate([
    serializeSceneObjectFlag,
    serializeProperty()
], PushNameController.prototype, "result", void 0);
__decorate([
    serializeSceneObjectFlag,
    serializeProperty()
], PushNameController.prototype, "countdown", void 0);
__decorate([
    serializeSceneObjectFlag,
    serializeProperty()
], PushNameController.prototype, "countText", void 0);
__decorate([
    serializeSceneObjectFlag,
    serializeProperty()
], PushNameController.prototype, "nameText", void 0);
__decorate([
    serializeSceneObjectFlag,
    serializeProperty()
], PushNameController.prototype, "timeText", void 0);
__decorate([
    serializeSceneObjectFlag,
    serializeProperty()
], PushNameController.prototype, "placedText", void 0);
__decorate([
    serializeSceneObjectFlag,
    serializeProperty()
], PushNameController.prototype, "movesText", void 0);
__decorate([
    serializeSceneObjectFlag,
    serializeProperty()
], PushNameController.prototype, "stateText", void 0);
__decorate([
    serializeSceneObjectFlag,
    serializeProperty()
], PushNameController.prototype, "resultTitle", void 0);
__decorate([
    serializeSceneObjectFlag,
    serializeProperty()
], PushNameController.prototype, "resultDetail", void 0);
__decorate([
    serializeSceneObjectFlag,
    serializeProperty()
], PushNameController.prototype, "startBtn", void 0);
__decorate([
    serializeSceneObjectFlag,
    serializeProperty()
], PushNameController.prototype, "retryBtn", void 0);
__decorate([
    serializeSceneObjectFlag,
    serializeProperty()
], PushNameController.prototype, "undoBtn", void 0);
__decorate([
    serializeSceneObjectFlag,
    serializeProperty()
], PushNameController.prototype, "restartBtn", void 0);
__decorate([
    serializeSceneObjectFlag,
    serializeProperty()
], PushNameController.prototype, "nextBtn", void 0);
__decorate([
    serializeSceneObjectFlag,
    serializeProperty()
], PushNameController.prototype, "sound", void 0);
__decorate([
    serializeSceneObjectFlag,
    serializeProperty()
], PushNameController.prototype, "party", void 0);
__decorate([
    serializeSceneObjectFlag,
    serializeProperty()
], PushNameController.prototype, "confetti", void 0);
PushNameController = PushNameController_1 = __decorate([
    component()
], PushNameController);
exports.PushNameController = PushNameController;
