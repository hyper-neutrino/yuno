// COPIED: Razetime's APLGolf
// SEE: https://github.com/razetime/APLgolf/blob/main/main.js

// Following five functions are courtesy of dzaima
function deflate(arr) {
    return pako.deflateRaw(arr, {
        "level": 9
    });
}

function inflate(arr) {
    return pako.inflateRaw(arr);
}

function TIOencode(str) {
    let bytes = new TextEncoder("utf-8").encode(str);
    return deflate(bytes);
}

function arrToB64(arr) {
    var bytestr = "";
    arr.forEach(c => bytestr += String.fromCharCode(c));
    return btoa(bytestr).replace(/\+/g, "@").replace(/=+/, "");
}

function b64ToArr(str) {
    return new Uint8Array([...atob(decodeURIComponent(str).replace(/@/g, "+"))].map(c => c.charCodeAt()))
}

// more help from dzaima here
async function TIO(code, input, flags, lang) {
    const encoder = new TextEncoder("utf-8");
    let length = encoder.encode(code).length;
    let iLength = encoder.encode(input).length;
    let fLength = flags.length;
    //  Vlang\u00001\u0000{language}\u0000F.code.tio\u0000{# of bytes in code}\u0000{code}F.input.tio\u0000{length of input}\u0000{input}Vargs\u0000{number of ARGV}{ARGV}\u0000R
    let rBody = "Vlang\x001\x00" + lang + "\x00F.code.tio\x00" + length + "\x00" + code + "F.input.tio\x00" + iLength + "\x00" + input + "Vargs\x00" + fLength + flags.map(x => "\x00" + x).join("") + "\x00R";
    rBody = TIOencode(rBody);
    let fetched = await fetch("https://tio.run/cgi-bin/run/api/", {
        method: "POST",
        headers: {
            "Content-Type": "text/plain;charset=utf-8"
        },
        body: rBody
    });
    let read = (await fetched.body.getReader().read()).value;
    let text = new TextDecoder('utf-8').decode(read);
    return text.slice(16).split(text.slice(0, 16));
}

// -----------------------------------------------------------------------------

function encode(obj) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
}

function decode(str) {
  return JSON.parse(decodeURIComponent(escape(atob(str))));
}

function url() {
  let flagbox = document.getElementById("flags");
  var items = [header.value, code.value, footer.value, stdin.value, flagbox.value, [...$(".argbox>textarea")].map(x => x.value)];
  return "/#" + encode(items);
}

function format() {
  let flagbox = document.getElementById("flags");
  return "# [yuno]" + (flagbox.value.trim() == "" ? "" : " `" + flagbox.value.trim() + "`") + ", " + code.value.length + " byte" + (code.value.length == 1 ? "" : "s") + "\n\n```\n" + code.value + "\n```\n\n[Try it online!](" + document.location + " \"yuno online interpreter\")\n\n[yuno]: https://github.com/hyper-neutrino/yuno";
}

let FLAGS = {
  "L": "forcelist",
  "T": "capten",
  "U": "ir_upper",
  "D": "ir_lower",
  "O": "ir_outer",
  "I": "ir_inner",
  "j": "ioj_newline",
  "s": "ioj_space",
  "d": "ioj_off",
  "t": "round_thousandth",
  "M": "memoize_off",
  "_": "cap_off",
  "K": "cap_k",
  "k": "seq_k",
  "W": "cap_tenk",
  "w": "seq_tenk",
  "h": "help"
};

var canceled = {};
var running = null;

function execute_code() {
  if (running) {
    canceled[running] = true;
    running = null;
    $("#run").html("RUN");
    output.value = "";
    stderr.value = "request terminated by user"
  } else {
    let flagbox = document.getElementById("flags");
    let outlabel = document.getElementById("tg-output");
    outlabel.innerHTML = outlabel.innerHTML[0] + " STDOUT";
    running = Math.random();
    $("#run").html("RUNNING...");
    program = "";
    if (header.value) program += header.value + "\n";
    program += code.value;
    if (footer.value) program += "\n" + footer.value;
    (r => fetch("/sourcecode").then(x => x.text()).then(code => TIO(code, stdin.value, [flagbox.value, program, ...[...$(".argbox>textarea")].map(x => x.value)], "python3")).then(result => {
      if (!canceled[r]) {
        output.value = result[0];
        stderr.value = result[1] || "";
        updateHeight(output);
        $("#run").html("RUN");
        running = null;
      }
    }))(running);
  }
}

var counter = 0;
function add_argument(target, value) {
  counter++;
  var field = $("<textarea id='argitem" + counter + "' class='args input'>");
  if (value) {
    field.prop("value", value);
  }
  var addbutton = $("<span onclick='add_argument(\"#argbox" + counter + "\")' class='addbutton'>").html("+ add");
  var rmbutton = $("<span onclick='rm_argument(\"#argbox" + counter + "\")' class='rmbutton'>").html("- remove");
  var box = $("<div id='argbox" + counter + "' class='argbox'>");
  box.append(addbutton);
  box.append(rmbutton);
  box.append($("<br>"));
  box.append(field);
  box.append($("<br>"));
  box.append($("<br>"));
  box.insertBefore(target);
}

function rm_argument(target) {
  $(target).remove();
}

updatehistory = {}

function updateHeight(element, force = false) {
  if (!force && updatehistory[element.id] == element.value) return;
  updatehistory[element.id] = element.value;
  element.style.height = "";
  element.style.height = element.scrollHeight + "px";
}

function toggle(t, u) {
  if (u.hidden) {
    t.innerHTML = "▾" + t.innerHTML.substring(1);
    u.hidden = false;
  } else {
    t.innerHTML = "▸" + t.innerHTML.substring(1);
    u.hidden = true;
  }
  if (u.id != "clas") updateHeight(u, true);
}

$(document).ready(e => {
  $(".wrap").on("keydown", e => e.ctrlKey && e.keyCode != 86 || e.metaKey || e.keyCode == 9 ? "" : e.preventDefault()).on("paste", e => e.preventDefault()).on("cut", e => e.preventDefault());
  const header = document.getElementById("header");
  const code = document.getElementById("code");
  const footer = document.getElementById("footer");
  const stdin = document.getElementById("stdin");
  const outlabel = document.getElementById("tg-output");
  const output = document.getElementById("output");
  const stderr = document.getElementById("stderr");
  const flagbox = document.getElementById("flags");
  const run = document.getElementById("run");

  if (document.location.hash) {
    var values = decode(document.location.hash.substring(1));
    header.value = values[0]; if (header.value) toggle(document.getElementById("tg-header"), header);
    code.value = values[1];
    footer.value = values[2]; if (footer.value) toggle(document.getElementById("tg-footer"), footer);
    stdin.value = values[3]; if (stdin.value) toggle(document.getElementById("tg-stdin"), stdin);
    flagbox.value = values[4]; if (flagbox.value) toggle(document.getElementById("tg-flags"), flagbox);
    for (var x of values[5]) {
      add_argument("#base", x);
    }
    if (values[5].length) toggle(document.getElementById("tg-clas"), document.getElementById("clas"));
    output.value = format();
  }

  toggle(document.getElementById("tg-code"), code);

  u = () => {
    [...$(".input")].forEach(x => updateHeight(x));
    requestAnimationFrame(u);
  };
  requestAnimationFrame(u);

  $(document).on("keydown", e => {
    if (e.ctrlKey && e.keyCode == 13) {
      e.preventDefault();
      execute_code();
    } else if (e.altKey && e.keyCode == 13) {
      e.preventDefault();
      var elem = document.activeElement;
      if (elem.readonly || !$(elem).is(".input")) return;
      if (elem.selectionStart != elem.selectionEnd) return;
      var pos = elem.selectionStart;
      var mx = "";
      for (var di of Object.keys(shortcuts)) {
        if (pos >= di.length && elem.value.substring(pos - di.length, pos) == di) {
          mx = mx.length > di.length ? mx : di;
        }
      }
      if (mx.length) {
        elem.value = elem.value.substring(0, pos - mx.length) + shortcuts[mx] + elem.value.substring(pos);
        elem.selectionStart = elem.selectionEnd = pos - mx.length + shortcuts[mx].length;
      }
    }
  });

  $("#run").on("click", e => {
    execute_code();
  });

  $("#link").on("click", e => {
    document.location = url();
    outlabel.innerHTML = outlabel.innerHTML[0] + " Stack Exchange post format";
    output.value = format();
    updateHeight(output);
  });

  $("#inline").on("click", e => {
    document.location = url();
    outlabel.innerHTML = outlabel.innerHTML[0] + " Inline markdown format";
    output.value = "[Try it online!](" + document.location + ")";
  });

  $(".toggler").on("click", e => {
    var t = e.target;
    var u = document.getElementById(e.target.getAttribute("data-target"));
    toggle(t, u);
  });
});
