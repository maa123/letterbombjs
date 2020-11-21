ArrayBuffer.prototype.to16Str = function() {
    const u8 = new Uint8Array(this);
    let strs = [];
    for (let i = 0; i < u8.length; i++) {
        strs.push(u8[i].toString(16));
    }
    return strs.join("");
}
ArrayBuffer.prototype.toStr = function() {
    const u8 = new Uint8Array(this);
    const strs = [];
    for (let i = 0; i < u8.length; i++) {
        strs.push(String.fromCharCode(u8[i]));
    }
    return strs.join('');
}
String.prototype.toAB = function() {
    const ab = new ArrayBuffer(this.length);
    const abv = new DataView(ab);
    for (let i = 0; i < this.length; i++) {
        abv.setUint8(i, this.charCodeAt(i));
    }
    return ab;
}
String.prototype.hexArray = function() {
    const arr = [];
    for (let i = 0; i < (this.length / 2); i++) {
        arr.push(parseInt(this.slice(i * 2, i * 2 + 2), 16));
    }
    return arr;
}
Number.prototype.zero = function(len) {
    return ('0'.repeat(len) + this).slice(-len);
}
Array.prototype.toAB = function() {
    const ab = new ArrayBuffer(this.length);
    const abv = new DataView(ab);
    for (let i = 0; i < this.length; i++) {
        abv.setUint8(i, this[i]);
    }
    return ab;
}
DataView.prototype.writeArrayBuffer = function(ab, start, end = -1) {
    if (end === -1) {
        end = ab.length + start;
    }
    const u8 = new Uint8Array(ab);
    for (let i = start; i < end; i++) {
        this.setUint8(i, u8[i - start]);
    }
}
DataView.prototype.writeArray = function(arr, start, end = -1) {
    if (end === -1) {
        end = arr.length + start;
    }
    for (let i = start; i < end; i++) {
        this.setUint8(i, arr[i - start]);
    }
}
DataView.prototype.singleFill = function(data, start, end) {
    for (let i = start; i < end; i++) {
        this.setUint8(i, data);
    }
}
Number.prototype.packArrayI = function() {
    const arr = [];
    let i = this;
    while (i) {
        arr.unshift(i % 256);
        i = Math.floor(i / 256);
    }
    return arr;
}