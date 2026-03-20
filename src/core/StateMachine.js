export class StateMachine {
    constructor(initialState) {
        this.state = initialState;
        this.transitions = {};
        this.onEnter = {};
        this.onExit = {};
    }

    addTransition(from, event, to) {
        if (!this.transitions[from]) this.transitions[from] = {};
        this.transitions[from][event] = to;
        return this;
    }

    setOnEnter(state, callback) {
        this.onEnter[state] = callback;
        return this;
    }

    setOnExit(state, callback) {
        this.onExit[state] = callback;
        return this;
    }

    send(event) {
        const t = this.transitions[this.state];
        if (!t || !t[event]) return false;

        const nextState = t[event];
        const exitCb = this.onExit[this.state];
        if (exitCb) exitCb(this.state, event);

        const prevState = this.state;
        this.state = nextState;

        const enterCb = this.onEnter[nextState];
        if (enterCb) enterCb(nextState, prevState);

        return true;
    }

    is(state) {
        return this.state === state;
    }
}
