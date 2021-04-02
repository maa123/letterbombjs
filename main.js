const focusId = (_this, Id) => {
    if (_this.value.length == 2) {
        document.getElementById(Id).focus();
    }
}
const oui_list = [];
const oui_search = [
    [],
    [],
    []
];
const getMacAddress = () => {
    const inputs = [];
    for (let i = 0; i < 6; i++) {
        inputs.push(document.getElementById(`m${i}`).value);
        if (inputs[i].length !== 2) {
            return false;
        }
        inputs[i] = parseInt(inputs[i], 16);
    }
    return inputs;
}
const checkMacAddress = () => {
    const inputs = getMacAddress();
    return (oui_list.some(v => v[0] === inputs[0] && v[1] === inputs[1] && v[2] === inputs[2]));
}
const sha1HMAC = async (key, msg) => {
    const k = await crypto.subtle.importKey('raw', new Uint8Array(key), {
        name: 'HMAC',
        hash: {
            name: 'SHA-1'
        }
    }, false, ['sign']);
    return await crypto.subtle.sign('HMAC', k, new Uint8Array(msg));
}
const createLetterBomb = async (macAddress, region) => {
    const dy = new Date((new Date()) - 86400000);
    const ts = Math.floor((dy.getTime() - (new Date("2000-01-01T00:00:00+0000")).getTime()) / 1000);
    const bin = await (await fetch(`./data/${region}`)).arrayBuffer();
    const binv = new DataView(bin);
    const hackmii = await (await fetch(`./data/hackmii.zip`)).arrayBuffer();
    const zip = await JSZip.loadAsync(hackmii);
    const key = await crypto.subtle.digest('SHA-1', macAddress.concat([0x75, 0x79, 0x79]).toAB());
    binv.writeArrayBuffer(key.slice(0, 8), 0x08, 0x10);
    binv.singleFill(0, 0xb0, 0xc4);
    binv.writeArray(ts.packArrayI(), 0x7c, 0x80);
    binv.writeArrayBuffer(ts.zero(10).toAB(), 0x80, 0x8a);
    const sig = await sha1HMAC(key.slice(8), binv.buffer);
    binv.writeArrayBuffer(sig, 0xb0, 0xc4);
    const date = {
        year: dy.getUTCFullYear(),
        month: dy.getUTCMonth().zero(2),
        date: dy.getUTCDate().zero(2),
        hour: dy.getUTCHours().zero(2),
        minute: dy.getUTCMinutes().zero(2)
    };
    zip.file(`private/wii/title/HAEA/${key.slice(0, 4).to16Str().toUpperCase()}/${key.slice(4, 8).to16Str().toUpperCase()}/${date.year}/${date.month}/${date.date}/${date.hour}/${date.minute}/HABA_#1/txt/${`00000000${ts.toString(16)}`.slice(-8).toUpperCase()}.000`, binv.buffer);
    const blob = await zip.generateAsync({
        type: 'blob'
    });
    const a = document.createElement("a");
    a.style.display = 'none';
    a.download = 'LetterBomb.zip';
    document.body.appendChild(a);
    const objUrl = window.URL.createObjectURL(blob);
    a.href = objUrl;
    a.click();
    window.URL.revokeObjectURL(objUrl);
}
(async () => {
    const oui_list_txt = await (await fetch('./data/oui_list.txt')).text();
    const oui = oui_list_txt.split('\n');
    for (let i = 0; i < oui.length; i++) {
        if (oui[i] !== "") {
            const mac = [];
            mac.push(parseInt(oui[i].slice(0, 2), 16));
            mac.push(parseInt(oui[i].slice(2, 4), 16));
            mac.push(parseInt(oui[i].slice(4, 6), 16));
            oui_list.push(mac);
            for (let j = 0; j < 3; j++) {
                oui_search[j].push(mac[j]);
            }
        }
    }
    for(let i = 0; i < 5; i++) {
        document.getElementById(`m${i}`).addEventListener('keyup', e => {
            if(e.key !== 'ArrowLeft'){
                focusId(e.target, `m${i+1}`);
            }
        });
    }
    document.getElementById('form').classList.remove('hide');
    document.getElementById('minputs').addEventListener('keyup', e => {
        e.target.classList.remove('input-ok');
        if (e.target.value.length == 2) {
            const _id = parseInt(`${e.target.id}`.replace(/[^0-9]/g, ''));
            if (_id > 2 || oui_search[_id].includes(parseInt(e.target.value, 16))) {
                e.target.classList.add('input-ok');
            }
        }
        if (checkMacAddress()) {
            document.getElementById('minfo').classList.remove('hide');
            document.getElementById('dl').removeAttribute("disabled");
        } else {
            document.getElementById('minfo').classList.add('hide');
            document.getElementById('dl').setAttribute("disabled", true);
        }
    });
    document.getElementById('dl').addEventListener('click', () => {
        const inputs = getMacAddress();
        createLetterBomb(inputs, document.getElementById('version').value).then(() => {
            document.getElementById('dl').removeAttribute("disabled");
            document.getElementById('infoText').textContent = "";
        });
        document.getElementById('dl').setAttribute("disabled", true);
        document.getElementById('infoText').textContent = "生成中...";
    });
})();