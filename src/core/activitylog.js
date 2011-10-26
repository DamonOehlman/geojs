var ActivityLog = GeoJS.ActivityLog = function() {
    this.entries = [];
    
    this._startTick = new Date().getTime();
    this._lastTick = this._startTick;
};

ActivityLog.prototype.entry = function(text) {
    var tick = new Date().getTime();
    
    // add an entry
    this.entries.push({
        text: text,
        elapsed: tick - this._lastTick,
        total: tick - this._startTick
    });
    
    // update the last tick
    this._lastTick = tick;
};