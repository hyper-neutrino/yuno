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
  "k": "ioj_space",
  "d": "ioj_off",
  "t": "round_thousandth",
  "M": "memoize_off",
  "_": "cap_off",
  "h": "help"
};

function execute_code() {
  document.location = url();
  let flagbox = document.getElementById("flags");
  let outlabel = document.getElementById("tg-output");
  outlabel.innerHTML = outlabel.innerHTML[0] + " STDOUT";
  var input = prompt;
  if (!$("#promptinstead").is(":checked")) {
    var lines = stdin.value.split("\n");
    lines.reverse();
    input = (a => () => a.pop())(lines);
  }
  output.value = "";
  stderr.value = "";
  var flags = {};
  for (var x of Object.keys(FLAGS)) {
    flags[FLAGS[x]] = flagbox.value.indexOf(x) != -1;
  }
  execute((header.value && header.value + "\n") + code.value + (footer.value && "\n" + footer.value), [...$(".argbox>textarea")].map(x => x.value), input, x => {
    output.value += x;
    if (!flags["cap_off"] && output.value.length > 131072) throw "output has exceeded 128 KB";
  }, x => stderr.value += x, flags);
  updateHeight(output);
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
    code.value = values[1]; toggle(document.getElementById("tg-code"), code);
    footer.value = values[2]; if (footer.value) toggle(document.getElementById("tg-footer"), footer);
    stdin.value = values[3]; if (stdin.value) toggle(document.getElementById("tg-stdin"), stdin);
    flagbox.value = values[4]; if (flagbox.value) toggle(document.getElementById("tg-flags"), flagbox);
    for (var x of values[5]) {
      add_argument("#base", x);
    }
    if (values[5].length) toggle(document.getElementById("tg-clas"), document.getElementById("clas"));
    output.value = format();
  }

  u = () => {
    [...$(".input")].forEach(x => updateHeight(x));
    requestAnimationFrame(u);
  };
  requestAnimationFrame(u);

  $(document).on("keydown", e => {
    if (e.ctrlKey && e.keyCode == 13) {
      e.preventDefault();
      execute_code();
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
