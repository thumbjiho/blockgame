"use strict";

function Game() {
  this.canvas = document.getElementById("myCanvas");
  this.holdCanvas = document.getElementById("holdCanvas");
  this.queueCanvas = document.getElementById("queueCanvas");
  this.v = null;
  this.bgCanvas = document.getElementById("bgLayer");
  this.bgctx = this.bgCanvas.getContext("2d");
  this.GS = new GameSlots(this);
  this.roomCapacity = 6;
  this.connectStatusElement =
    document.getElementById("connectStatus");
  this.rInfoBox = document.getElementById("rInfoBox");
  this.practiceMenu = document.getElementById("practiceMenu");
  this.practiceMenuBig = document.getElementById("practice-menu-big");
  this.teamInfo = document.getElementById("teamInfo");
  this.sprintInfo = document.getElementById("sprintInfo");
  this.botMenu = document.createElement("div");
  this.lrem = document.getElementById("lrem");
  this.fpsElement = document.getElementById("fps");
  this.block_size = 24;
  this.debug = false;
  this.SEenabled = true;
  this.VSEenabled = false;
  this.SEStartEnabled = true;
  this.SEFaultEnabled = false;
  this.SErotate = false;
  createjs.Sound.registerPlugins([createjs.WebAudioPlugin]);
  createjs.Sound.volume = 0.6;
  this.tex = new Image();
  this.tex2 = new Image();
  this.tex2.src = "/res/tex2.png";
  this.drawScale = 1;
  this.skinId = 0;
  this.ghostTex = null;
  this.ghostSkinId = 0;
  this.ghostSkins = [
    {
      id: 0,
      name: "Default",
      data: "",
    },
    {
      id: 1,
      name: "Custom",
      data: "",
      w: 36,
    },
  ];
  this.SFXset = null;
  this.VSFXset = null;
  this.play = false;
  this.gameEnded = false;
  this.hdAbort = false;
  this.lastSeen = null;
  this.isTabFocused = true;
  this.pmode = 0;
  this.livePmode = 0;
  this.selectedPmode = 1;
  this.sprintMode = 1;
  this.sprintModeToRun = 1;
  this.sprintModes = {
    1: 40,
    2: 20,
    3: 100,
    4: 1000,
  };
  this.cheeseModes = {
    1: 10,
    2: 18,
    3: 100,
    100: 1000000,
  };
  this.ultraModes = {
    1: 120,
  };
  this.cheeseLevel = undefined;
  this.maxCheeseHeight = 9;
  this.minCheeseHeight = 3;
  this.lastHolePos = null;
  this.starting = false;
  this.activeBlock = new Block(0);
  this.ghostPiece = {
    pos: {
      x: 0,
      y: 0,
    },
  };
  this.timer = 0;
  this.lastSnapshot = 0;
  this.clock = 0;
  this.frames = 0;
  this.baseGravity = null;
  this.currentGravity = [0.9, 0];
  this.softDrop = false;
  this.softDropId = 2;
  this.holdPressed = false;
  this.hardDropPressed = false;
  this.lastDAS = 0;
  this.firstDAS = true;
  this.DASdebug = false;
  this.ARRtime = 0;
  this.pressedDir = {
    "-1": false,
    1: false,
  };
  this.ARRon = {
    "-1": false,
    1: false,
  };
  this.DASto = {
    "-1": null,
    1: null,
  };
  this.DASmethod = 1;
  this.lockDelayActive = false;
  this.lockDelayActivated = undefined;
  this.lastAction = 0;
  this.lastHardDrop = 0;
  this.lastGeneration = 0;
  this.lockDelay = null;
  this.maxLockDelayWithoutLock = null;
  this.maxWithoutLock = null;
  this.holdUsedAlready = false;
  this.temporaryBlockSet = null;
  this.redBar = 0;
  this.incomingGarbage = [];
  this.solidHeight = 0;
  this.solidToAdd = 0;
  this.solidInterval = null;
  this.solidProfiles = [
    [0, 3],
    [
      0, 3, 2.8, 2.6, 2.4, 2.2, 2, 1.8, 1.6, 1.4, 1.2, 1, 31, 1, 1, 1,
      1, 1, 1, 1,
    ],
    null,
    null,
  ];
  this.garbageCols = [];
  this.blockInHold = null;
  this.focusState = 0;
  this.statsEnabled = false;
  this.statsMode = 0;
  this.placedBlocks = 0;
  this.lastPlacements = [];
  this.finesse = 0;
  this.used180 = 0;
  this.totalFinesse = 0;
  this.totalKeyPresses = 0;
  this.place = null;
  this.redrawBlocked = false;
  this.linesAttackDef = [0, 0, 1, 2, 4, 4, 6, 2, 0, 10, 1];
  this.linesAttack = this.linesAttackDef;
  this.cheeseHeight = 10;
  this.ghostEnabled = true;
  this.getPPS = this.getCumulativePPS;
  this.comboAttackDef = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4, 4, 4, 5];
  this.comboAttack = this.comboAttackDef;
  this.comboCounter = -1;
  this.fourWideFlag = false;
  this.PCdata = {
    blocks: 0,
    lines: 0,
  };
  this.linesRemaining = 0;
  this.inactiveGamesCount = 0;
  this.xbuffMask = 1;
  this.replayPartsSent = 0;
  this.replay2PartsSent = 0;
  this.transmitMode = 0;
  this.fragmentCounter = 0;
  this.liveSnapRate = 100;
  this.snapRate = 1000;
  this.soundQ = new SoundQueue();
  this.RNG = alea(this.timestamp());
  this.blockRNG = this.RNG;
  this.blockSeed = "";
  this.bigTriggered = false;
  this.bigChance = 100000000;
  this.interval = null;
  this.animator = null;
  GameCore.call(this, true);
  this.RulesetManager = new RulesetManager(this);
  this.conf = [{}, {}];
  this.RulesetManager.applyRule({}, this.conf[0]);
  this.RulesetManager.applyRule({}, this.conf[1]);
  this.R = this.conf[0];
  this.RulesetManager.ruleSetChange(0);
  this.RulesetManager.setActiveMode(1);
  this.Settings = new Settings(this);
  this.Settings.startWebGL(false);
  this.Settings.init();
  this.Caption = new GameCaption(document.getElementById("stage"));
  this.Live = new Live(this);
  this.Replay = new Replay();
  this.Replay2 = null;
  this.Scoring = new Scoring();
  this.MapManager = new MapManager(this);
  this.ModeManager = new ModeManager(this);
  this.GameStats = new StatsManager(this.v);
  this.Mobile = new Mobile(this);
  this.Bots = null;
  this.botPlacement = null;
  this.botPlacementVisible = false;
  this.setLockDelay(this.R.lockDelay);
  this.applyGravityLvl(this.R.gravityLvl);
  this.changeSkin(this.skinId);
  this.initSFX();
  this.Settings.setupSwipeControl();
  this.Live.connect();
  this.setupGameLinks();
}
var GameProto = Object.create(GameCore.prototype);
Game.prototype = GameProto;
Game.prototype.constructor = Game;
Game.prototype.rollBigSpawn = function () {
  if (this.bigChance) {
    var _0x9e79ce = Math.floor(Math.random() * this.bigChance);
    var _0x30f90a = new Date();
    if (
      !!this.Live.LiveGameRunning &&
      !this.pmode &&
      _0x9e79ce === 0 &&
      (_0x30f90a.getDate() === 1 ||
        _0x30f90a.getDate() === 2 ||
        _0x30f90a.getDate() === 31)
    ) {
      this.bigTriggered = true;
    }
  }
};
Game.prototype.loadGhostSkin = function (_0x448b03, _0xd013f1) {
  this.ghostSkins[1].w = _0xd013f1;
  this.ghostTex = new Image();
  this.ghostTex.src = this.ghostSkins[1].data = _0x448b03;
  this.ghostSkinId = 1;
  if (this.v.NAME === "webGL") {
    this.v.loadTexture(1, _0x448b03);
  }
  this.redraw();
};
Game.prototype.changeSkin = function (_0x5e6258) {
  var _0x59b314;
  if (
    _0x5e6258 >= 1000 ||
    (this.skins[_0x5e6258] !== undefined &&
      this.skins[_0x5e6258].data)
  ) {
    this.skinId = _0x5e6258;
  } else {
    _0x5e6258 = this.skinId = 0;
  }
  var _0x3db09a =
    _0x5e6258 >= 1000 ||
    this.skins[_0x5e6258].cdn === undefined ||
    this.skins[_0x5e6258].cdn;
  _0x59b314 =
    _0x5e6258 >= 1000
      ? "/res/b/" + this.customSkinPath + ".png"
      : this.skins[_0x5e6258].data;
  var _0x247a0b = _0x3db09a ? CDN_URL(_0x59b314) : _0x59b314;
  if (_0x5e6258 > 0) {
    this.tex.src = _0x247a0b;
    if (this.v.NAME === "webGL") {
      this.v.loadTexture(0, _0x247a0b);
    }
    if (_0x5e6258 >= 1000) {
      this.skins[_0x5e6258] = {
        id: _0x5e6258,
        data: _0x59b314,
        w: 32,
      };
    }
  } else if (_0x5e6258 === 0 && this.v.NAME === "webGL") {
    this.v.loadTexture(0, null);
  }
  this.redrawAll();
};
Game.prototype.initSFX = function () {
  createjs.Sound.removeAllSounds();
  if (!SFXsets[this.Settings.SFXsetID]) {
    this.Settings.SFXsetID = 2;
  }
  if (this.VSEenabled && !VSFXsets[this.Settings.VSFXsetID]) {
    this.VSEenabled = false;
    this.Settings.VSFXsetID = 1;
  }
  this.changeSFX(new SFXsets[this.Settings.SFXsetID].data());
  if (this.VSEenabled) {
    this.changeSFX(new VSFXsets[this.Settings.VSFXsetID].data(), 1);
  }
};
Game.prototype.changeSFX = function (_0x2a1120, _0x2576dc) {
  var _0x413a4e;
  if (!_0x2576dc) {
    _0x2576dc = 0;
  }
  if (_0x2576dc === 0) {
    this.SFXset = _0x2a1120;
    _0x413a4e = "";
  } else if (_0x2576dc === 1) {
    this.VSFXset = _0x2a1120;
    _0x413a4e = "v_";
  }
  this.loadSounds(_0x2a1120, _0x413a4e);
};
Game.prototype.loadSounds = function (_0x9a7ba1, _0x1749ee) {
  var _0x5d9d19 = [
    "hold",
    "linefall",
    "lock",
    "harddrop",
    "rotate",
    "success",
    "garbage",
    "b2b",
    "land",
    "move",
    "died",
    "ready",
    "go",
    "golive",
    "ding",
    "msg",
    "fault",
    "item",
    "pickup",
  ];
  if (_0x9a7ba1.harddrop === null) {
    _0x9a7ba1.harddrop = _0x9a7ba1.lock;
  }
  if (!this.SErotate) {
    var _0x533c52 = _0x5d9d19.indexOf("rotate");
    if (_0x533c52 !== -1) {
      _0x5d9d19.splice(_0x533c52, 1);
    }
  }
  function _0x47b3b9(_0xe86db5, _0x3272d2) {
    if (!_0xe86db5 || !_0x3272d2) {
      return;
    }
    let _0x3c65dd = _0x9a7ba1.getSoundUrlFromObj(_0x3272d2);
    _0xe86db5 = _0x1749ee + _0xe86db5;
    if (_0x3c65dd) {
      let _0x1c90d9 = createjs.Sound.registerSound(
        _0x3c65dd,
        _0xe86db5,
      );
      if (!_0x1c90d9 || !createjs.Sound._idHash[_0xe86db5]) {
        console.error(
          "loadSounds error: src parse / cannot init plugins, id=" +
            _0xe86db5 +
            (_0x1c90d9 === false ? ", rs=false" : ", no _idHash"),
        );
        return;
      }
      createjs.Sound._idHash[_0xe86db5].sndObj = _0x3272d2;
    }
  }
  if (_0x9a7ba1.scoring) {
    for (
      var _0x39eed6 = 0;
      _0x39eed6 < _0x9a7ba1.scoring.length;
      ++_0x39eed6
    ) {
      if (_0x9a7ba1.scoring[_0x39eed6]) {
        _0x47b3b9("s" + _0x39eed6, _0x9a7ba1.scoring[_0x39eed6]);
      }
    }
  }
  if (_0x9a7ba1.b2bScoring && Array.isArray(_0x9a7ba1.b2bScoring)) {
    for (
      _0x39eed6 = 0;
      _0x39eed6 < _0x9a7ba1.b2bScoring.length;
      ++_0x39eed6
    ) {
      if (_0x9a7ba1.b2bScoring[_0x39eed6]) {
        _0x47b3b9("bs" + _0x39eed6, _0x9a7ba1.b2bScoring[_0x39eed6]);
      }
    }
  }
  if (_0x9a7ba1.spawns) {
    for (var _0x366a85 in _0x9a7ba1.spawns) {
      _0x47b3b9("b_" + _0x366a85, _0x9a7ba1.spawns[_0x366a85]);
    }
  }
  for (_0x39eed6 = 0; _0x39eed6 < _0x5d9d19.length; ++_0x39eed6) {
    let _0x29e771 = _0x5d9d19[_0x39eed6];
    _0x47b3b9(_0x29e771, _0x9a7ba1[_0x29e771]);
  }
  if (_0x9a7ba1.comboTones && Array.isArray(_0x9a7ba1.comboTones)) {
    for (
      _0x39eed6 = 0;
      _0x39eed6 < _0x9a7ba1.comboTones.length;
      ++_0x39eed6
    ) {
      var _0x47ff25 = _0x9a7ba1.comboTones[_0x39eed6];
      if (_0x47ff25) {
        createjs.Sound.registerSound(
          _0x9a7ba1.getSoundUrlFromObj(_0x47ff25),
          _0x1749ee + "c" + _0x39eed6,
        );
      }
    }
    _0x9a7ba1.maxCombo = _0x9a7ba1.comboTones.length - 1;
  } else if (_0x9a7ba1.comboTones) {
    var _0x314180 = [];
    for (
      _0x39eed6 = 0;
      _0x39eed6 < _0x9a7ba1.comboTones.cnt;
      ++_0x39eed6
    ) {
      _0x314180.push({
        id: _0x1749ee + "c" + _0x39eed6,
        startTime:
          _0x39eed6 *
          (_0x9a7ba1.comboTones.duration +
            _0x9a7ba1.comboTones.spacing),
        duration: _0x9a7ba1.comboTones.duration,
      });
    }
    _0x9a7ba1.maxCombo = _0x9a7ba1.comboTones.cnt - 1;
    var _0x4e4e66 = [
      {
        src: _0x9a7ba1.getSoundUrl("comboTones"),
        data: {
          audioSprite: _0x314180,
        },
      },
    ];
    createjs.Sound.registerSounds(_0x4e4e66, "");
  }
};
Game.prototype.unloadSounds = function (_0x52fdc5, _0x5b0fd8) {
  if (typeof createjs != "undefined" && createjs.Sound && _0x52fdc5) {
    if (_0x5b0fd8 == null) {
      _0x5b0fd8 = "";
    }
    var _0x464c60 = [
      "hold",
      "linefall",
      "lock",
      "harddrop",
      "rotate",
      "success",
      "garbage",
      "b2b",
      "land",
      "move",
      "died",
      "ready",
      "go",
      "golive",
      "ding",
      "msg",
      "fault",
      "item",
      "pickup",
    ];
    var _0x47f501 = [];
    if (_0x52fdc5.scoring && Array.isArray(_0x52fdc5.scoring)) {
      for (
        var _0x91d2db = 0;
        _0x91d2db < _0x52fdc5.scoring.length;
        ++_0x91d2db
      ) {
        _0x47f501.push(_0x5b0fd8 + "s" + _0x91d2db);
      }
    }
    if (_0x52fdc5.b2bScoring && Array.isArray(_0x52fdc5.b2bScoring)) {
      for (
        _0x91d2db = 0;
        _0x91d2db < _0x52fdc5.b2bScoring.length;
        ++_0x91d2db
      ) {
        _0x47f501.push(_0x5b0fd8 + "bs" + _0x91d2db);
      }
    }
    if (_0x52fdc5.spawns && typeof _0x52fdc5.spawns == "object") {
      for (var _0x3d3f4a in _0x52fdc5.spawns) {
        _0x47f501.push(_0x5b0fd8 + "b_" + _0x3d3f4a);
      }
    }
    for (_0x91d2db = 0; _0x91d2db < _0x464c60.length; ++_0x91d2db) {
      _0x47f501.push(_0x5b0fd8 + _0x464c60[_0x91d2db]);
    }
    if (_0x52fdc5.comboTones && Array.isArray(_0x52fdc5.comboTones)) {
      for (
        _0x91d2db = 0;
        _0x91d2db < _0x52fdc5.comboTones.length;
        ++_0x91d2db
      ) {
        _0x47f501.push(_0x5b0fd8 + "c" + _0x91d2db);
      }
    } else if (
      _0x52fdc5.comboTones &&
      typeof _0x52fdc5.comboTones == "object" &&
      Number.isInteger(_0x52fdc5.comboTones.cnt)
    ) {
      for (
        _0x91d2db = 0;
        _0x91d2db < _0x52fdc5.comboTones.cnt;
        ++_0x91d2db
      ) {
        _0x47f501.push(_0x5b0fd8 + "c" + _0x91d2db);
      }
    }
    for (_0x91d2db = 0; _0x91d2db < _0x47f501.length; ++_0x91d2db) {
      try {
        createjs.Sound.removeSound(_0x47f501[_0x91d2db]);
      } catch (_0x571aca) {}
    }
  }
};
Game.prototype.drawBgGrid = function (_0x37d3dd) {
  _0x37d3dd = _0x37d3dd === undefined ? 1 : _0x37d3dd;
  this.bgctx.rect(0, 0, this.canvas.width, this.canvas.height);
  this.bgctx.fillStyle = "#000000";
  this.bgctx.fill();
  this.bgctx.beginPath();
  this.bgctx.lineWidth = 1;
  if (_0x37d3dd === 1) {
    for (var _0x1fcdcc = 1; _0x1fcdcc < 10; _0x1fcdcc++) {
      this.bgctx.moveTo(_0x1fcdcc * this.block_size + 0.5, 0);
      this.bgctx.lineTo(
        _0x1fcdcc * this.block_size + 0.5,
        this.canvas.height,
      );
    }
    for (_0x1fcdcc = 1; _0x1fcdcc < 20; _0x1fcdcc++) {
      this.bgctx.moveTo(0, _0x1fcdcc * this.block_size + 0.5);
      this.bgctx.lineTo(241, _0x1fcdcc * this.block_size + 0.5);
    }
    this.bgctx.strokeStyle = "#101010";
    this.bgctx.stroke();
    this.bgctx.beginPath();
    for (_0x1fcdcc = 0; _0x1fcdcc < 9; _0x1fcdcc++) {
      for (var _0xa9127f = 1; _0xa9127f < 20; _0xa9127f++) {
        this.bgctx.moveTo(
          _0x1fcdcc * this.block_size + this.block_size * 0.75,
          _0xa9127f * this.block_size + 0.5,
        );
        this.bgctx.lineTo(
          (_0x1fcdcc + 1) * this.block_size + this.block_size * 0.2,
          _0xa9127f * this.block_size + 0.5,
        );
      }
    }
    for (_0x1fcdcc = 0; _0x1fcdcc < 19; _0x1fcdcc++) {
      for (var _0x8552bc = 1; _0x8552bc < 10; _0x8552bc++) {
        this.bgctx.moveTo(
          _0x8552bc * this.block_size + 0.5,
          _0x1fcdcc * this.block_size + this.block_size * 0.75,
        );
        this.bgctx.lineTo(
          _0x8552bc * this.block_size + 0.5,
          (_0x1fcdcc + 1) * this.block_size + this.block_size * 0.2,
        );
      }
    }
    this.bgctx.strokeStyle = "#202020";
    this.bgctx.stroke();
    this.bgctx.beginPath();
  } else if (_0x37d3dd === 2) {
    for (_0x1fcdcc = 0; _0x1fcdcc < 9; _0x1fcdcc++) {
      for (_0xa9127f = 1; _0xa9127f < 20; _0xa9127f++) {
        this.bgctx.moveTo(
          _0x1fcdcc * this.block_size + this.block_size * 0.75,
          _0xa9127f * this.block_size - 0.5,
        );
        this.bgctx.lineTo(
          (_0x1fcdcc + 1) * this.block_size + this.block_size * 0.2,
          _0xa9127f * this.block_size - 0.5,
        );
      }
    }
    for (_0x1fcdcc = 0; _0x1fcdcc < 19; _0x1fcdcc++) {
      for (_0x8552bc = 1; _0x8552bc < 10; _0x8552bc++) {
        this.bgctx.moveTo(
          _0x8552bc * this.block_size - 0.5,
          _0x1fcdcc * this.block_size + this.block_size * 0.75,
        );
        this.bgctx.lineTo(
          _0x8552bc * this.block_size - 0.5,
          (_0x1fcdcc + 1) * this.block_size + this.block_size * 0.2,
        );
      }
    }
  } else if (_0x37d3dd === 3) {
    for (_0x1fcdcc = 1; _0x1fcdcc < 10; _0x1fcdcc++) {
      this.bgctx.moveTo(_0x1fcdcc * this.block_size + 0.5, 0);
      this.bgctx.lineTo(
        _0x1fcdcc * this.block_size + 0.5,
        this.canvas.height,
      );
    }
  } else if (_0x37d3dd === 4) {
    for (_0x1fcdcc = 1; _0x1fcdcc < 10; _0x1fcdcc++) {
      this.bgctx.moveTo(_0x1fcdcc * this.block_size + 0.5, 0);
      this.bgctx.lineTo(
        _0x1fcdcc * this.block_size + 0.5,
        this.canvas.height,
      );
    }
    for (_0x1fcdcc = 1; _0x1fcdcc < 20; _0x1fcdcc++) {
      this.bgctx.moveTo(0, _0x1fcdcc * this.block_size + 0.5);
      this.bgctx.lineTo(241, _0x1fcdcc * this.block_size + 0.5);
    }
  }
  this.bgctx.strokeStyle = "#393939";
  this.bgctx.stroke();
  this.bgctx.lineWidth = 2;
  this.bgctx.strokeRect(1, 1, 240, this.canvas.height - 2);
};
Game.prototype.isPmode = function (_0x4c3bec) {
  if (_0x4c3bec) {
    return this.pmode;
  } else if (this.livePmode) {
    return this.livePmode;
  } else {
    return this.pmode;
  }
};
Game.prototype.startPractice = function (
  _0x176430,
  _0x6757ed,
  _0x32a922 = {
    callback: null,
    isLivePmode: false,
    mapId: null,
    mapForOpponents: false,
  },
) {
  if (
    (!this.starting || _0x32a922.isLivePmode) &&
    (!this.play || !this.Live.LiveGameRunning || this.pmode)
  ) {
    if (!this.Live.socket && !this.Live.playingOfflineWarningShown) {
      this.Live.showOfflineWarning();
    }
    if (this.pmode !== _0x176430) {
      this.RulesetManager.setActiveMode(_0x176430);
    }
    if (_0x6757ed) {
      this.sprintMode = -1;
    }
    this.pmode = this.selectedPmode = _0x176430;
    this.RulesetManager.adjustToValidMode(_0x176430, this.sprintMode);
    this.play = false;
    this.Replay = new Replay();
    this.Replay.config.m = this.pmode;
    if (!_0x32a922.isLivePmode) {
      this.Replay.config.r = this.RulesetManager.pmodeRuleId;
    }
    this.R = _0x32a922.isLivePmode ? this.conf[0] : this.conf[1];
    this.temporaryBlockSet = null;
    this.generatePracticeQueue(this.R.rnd);
    this.updateQueueBox();
    this.sprintInfoLineContent(0);
    hideElem(this.practiceMenu);
    this.Live.toggleMorePractice(true, false);
    hideElem(this.Live.teamOptions);
    hideElem(this.teamInfo);
    hideElem(this.botMenu);
    this.ModeManager.resetUI();
    var _0xd2a592 = _0x32a922.callback
      ? _0x32a922.callback
      : function () {
          this.Live.sendPracticeModeStarting();
          this.readyGo();
        };
    if (this.pmode === 1) {
      this.Replay.config.m = this.sprintMode;
      this.linesRemaining = this.sprintModes[this.sprintMode];
      this.lrem.textContent = this.linesRemaining;
      showElem(this.sprintInfo);
    } else if (this.pmode === 2) {
      this.Replay.config.m = 131072;
      this.linesRemaining = 9999999999;
      hideElem(this.sprintInfo);
    } else if (this.pmode === 3) {
      this.Replay.config.m = this.sprintMode | 196608;
      this.linesRemaining = this.cheeseModes[this.sprintMode];
      this.setLrem(this.linesRemaining);
      showElem(this.sprintInfo);
    } else if (this.pmode === 4) {
      this.sprintMode = 1;
      this.Replay.config.m = this.sprintMode | 262144;
      this.linesRemaining = 9999999999;
      this.setLrem(9999999999);
      hideElem(this.sprintInfo);
    } else if (this.pmode === 5) {
      this.sprintMode = 1;
      this.Replay.config.m = this.sprintMode | 327680;
      showElem(this.sprintInfo);
      this.linesRemaining = this.ultraModes[this.sprintMode];
      this.lrem.textContent = sprintTimeFormat(
        this.linesRemaining,
        -1,
      );
      this.sprintInfoLineContent(1);
    } else {
      if (this.pmode === 6) {
        hideElem(this.sprintInfo);
        this.Replay.config.m = 393216;
        this.linesRemaining = 9999999999;
        this.setLrem(9999999999);
        this.v.clearMainCanvas();
        this.v.clearQueueCanvas();
        this.v.clearHoldCanvas();
        this.Caption.mapLoading();
        this.MapManager.onMapReady = function () {
          if (_0x32a922.mapForOpponents) {
            this.Live.loadMapForOpponents = true;
            for (var _0xb3bfe5 in this.GS.cidSlots) {
              if (
                this.Live.clients[_0xb3bfe5] &&
                this.Live.clients[_0xb3bfe5].rep
              ) {
                this.Live.clients[_0xb3bfe5].rep.loadMap(
                  this.MapManager.matrix,
                  this.MapManager.mapData.queue,
                );
              }
            }
          }
          this.matrix = copyMatrix(this.MapManager.matrix);
          this.Replay.config.map = this.sprintMode =
            this.MapManager.mapId;
          this.redrawMatrix();
          if (this.MapManager.mapData.queue) {
            var _0x264553 = this.MapManager.mapData.queue;
            this.queue = [];
            for (
              var _0x2b274f = 0;
              _0x2b274f < _0x264553.length;
              ++_0x2b274f
            ) {
              this.queue.push(
                new Block(this.blockIds[_0x264553[_0x2b274f]]),
              );
            }
          }
          this.updateQueueBox();
          _0xd2a592.call(this);
        }.bind(this);
        this.MapManager.prepare(_0x32a922.mapId);
        return;
      }
      if (this.pmode === 7) {
        this.sprintMode = 1;
        this.Replay.config.m = this.sprintMode | 458752;
        showElem(this.sprintInfo);
        this.linesRemaining = 9999999999;
        this.lrem.textContent = 0;
        this.sprintInfoLineContent(2);
      } else if (this.pmode === 8) {
        this.sprintMode = 1;
        this.Replay.config.m = this.sprintMode | 524288;
        this.PCdata = {
          blocks: 0,
          lines: 0,
        };
        showElem(this.sprintInfo);
        this.linesRemaining = 9999999999;
        this.lrem.textContent = 0;
        this.sprintInfoLineContent(3);
        this.RulesetManager.appendRule(
          {
            grav: 10,
          },
          this.conf[1],
        );
      } else if (this.pmode === 9) {
        hideElem(this.sprintInfo);
        this.activeBlock = new Block(0);
        this.activeBlock.pos = {
          x: 0,
          y: -2,
        };
        this.ghostPiece.pos.y = -2;
        this.Replay.config.m = 589824;
        this.linesRemaining = 9999999999;
        this.garbageCols = [];
        this.gameEnded = false;
        this.blockInHold = null;
        this.clock = 0;
        this.deadline = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.clearMatrix();
        this.RulesetManager.applyRule({}, this.R);
        this.generatePracticeQueue(this.R.rnd);
        this.setLrem(9999999999);
        this.v.clearMainCanvas();
        this.v.clearQueueCanvas();
        this.v.clearHoldCanvas();
        this.Caption.mapLoading(1);
        this.GameStats.adjustToGameMode();
        this.Replay2 = null;
        this.ModeManager.onReady = function () {
          this.Caption.hide();
          this.ModeManager.initialExecCommands(() => {
            _0xd2a592.call(this);
          });
          this.updateQueueBox();
        }.bind(this);
        this.ModeManager.isLivePmodeSession =
          !!_0x32a922 && !!_0x32a922.isLivePmode;
        this.ModeManager.prepare(_0x32a922.mapId);
        this.starting = true;
        return;
      }
    }
    _0xd2a592.call(this);
  }
};
Game.prototype.readyGo = function () {
  this.starting = true;
  this.Caption.hideExcept(this.Caption.MODE_INFO);
  this.livePmode = 0;
  this.Live.loadMapForOpponents = false;
  if (!this.pmode) {
    this.Live.beforeReset();
    this.Replay.config.m = -1;
    this.Replay.config.m = 6553600;
    this.Replay.config.seed = this.blockSeed;
    delete this.Replay.config.r;
    this.v.clearQueueCanvas();
    for (
      var _0x17bcd6 = 0;
      _0x17bcd6 < this.Live.maxSlots;
      _0x17bcd6++
    ) {
      this.GS.slots[_0x17bcd6].clear();
    }
    this.R = this.conf[0];
    hideElem(this.rInfoBox);
    hideElem(this.practiceMenuBig);
    hideElem(this.Live.teamOptions);
    if (this.Live.liveMode === 2) {
      hideElem(this.sprintInfo);
      hideElem(this.practiceMenu);
      hideElem(this.botMenu);
      showElem(this.teamInfo);
      showElem(this.rInfoBox);
    } else if (this.Live.liveMode === 3) {
      this.pmode = this.Live.livePmodeTypes[0];
      this.sprintMode = this.Live.livePmodeTypes[1];
      if (this.pmode === 6) {
        this.sprintMode = this.Live.liveMap;
      } else if (this.pmode === 9) {
        this.sprintMode = this.Live.liveModeId ?? 1;
      }
      var _0x8f459c = {
        callback: function () {
          this.livePmode = this.pmode;
          this.pmode = 0;
          showElem(this.rInfoBox);
          if (
            (this.livePmode !== 6 ||
              !this.MapManager.mapData.queue) &&
            (this.livePmode !== 9 || !this.ModeManager.noQueueRefill)
          ) {
            this.generateLiveQueue();
            this.updateQueueBox();
          }
          if (this.livePmode === 9 && this.Live.umLoadingPhase) {
            this.Caption.mapLoading(2);
            this.Live.sendUsermodeReady();
            return;
          }
          this.startReadyGo();
        }.bind(this),
        isLivePmode: true,
        mapId: this.sprintMode,
        mapForOpponents: true,
      };
      this.startPractice(this.pmode, false, _0x8f459c);
      return;
    }
  }
  this.startReadyGo();
};
Game.prototype.startReadyGo = function () {
  if (this.isPmode(false) !== 9) {
    this.blockInHold = null;
  }
  this.redrawHoldBox();
  if (this.isPmode(false) !== 6 && this.isPmode(false) !== 9) {
    this.v.clearMainCanvas();
  }
  var _0x35fc47 = 2;
  if (this.SEStartEnabled) {
    this.playSound("ready");
  }
  this.Caption.readyGo(0);
  var _0x362cbc = this;
  this.interval = setInterval(function () {
    if ((_0x35fc47 -= 1) === 1) {
      _0x362cbc.Caption.readyGo(1);
      if (_0x362cbc.SEStartEnabled) {
        _0x362cbc.playSound(
          _0x362cbc.isPmode(true) ? "go" : "golive",
        );
      }
    } else if (_0x35fc47 === 0) {
      clearInterval(_0x362cbc.interval);
      _0x362cbc.restart();
      _0x362cbc.starting = false;
    }
  }, 900);
};
Game.prototype.getPlace = function (_0x1b65a5, _0x47e939) {
  var _0x5dc5dc = 7;
  if (_0x47e939) {
    if (_0x1b65a5) {
      _0x5dc5dc = this.Live.players.length + 1;
    } else if (this.place !== null) {
      _0x5dc5dc = this.place;
    } else {
      var _0x140a75 = 0;
      for (
        var _0x147dce = 0;
        _0x147dce < this.Live.players.length;
        _0x147dce++
      ) {
        if (
          this.Live.notPlaying.indexOf(
            this.Live.players[_0x147dce],
          ) !== -1
        ) {
          _0x140a75 += 1;
        }
      }
      _0x5dc5dc = this.Live.players.length - _0x140a75 + 1;
    }
    this.place = _0x5dc5dc;
    this.Caption.gamePlace(this);
  } else {
    _0x5dc5dc = _0x1b65a5
      ? this.Live.players.length + 1
      : this.Live.players.length - this.Live.notPlaying.length + 1;
  }
  return _0x5dc5dc;
};
Game.prototype.getPlaceColor = function (_0x4a1723) {
  var _0x49abc7 = {
    str: "",
    color: "",
  };
  var _0x4f0b6c = i18n.th;
  var _0x2d947a = _0x4a1723 / 10;
  if (_0x2d947a < 0.4 || _0x2d947a > 2) {
    switch (_0x4a1723 % 10) {
      case 1:
        _0x4f0b6c = i18n.st;
        break;
      case 2:
        _0x4f0b6c = i18n.nd;
        break;
      case 3:
        _0x4f0b6c = i18n.rd;
        break;
      default:
        _0x4f0b6c = i18n.th;
    }
  }
  _0x49abc7.str = _0x4a1723 + _0x4f0b6c;
  switch (_0x4a1723) {
    case 1:
      _0x49abc7.color = "yellow";
      break;
    case 2:
      _0x49abc7.color = "orange";
      break;
    case 3:
      _0x49abc7.color = "#FC6D3D";
      break;
    default:
      _0x49abc7.color = "#00BFFF";
  }
  return _0x49abc7;
};
Game.prototype.start = function () {
  this.generateQueue();
  this.getNextBlock();
  this.redraw();
  this.run();
  this.Live.onReset();
};
Game.prototype.restart = function () {
  if (this.starting && (this.Live.LiveGameRunning || this.pmode)) {
    if (this.inactiveGamesCount === 2 && !this.isPmode(true)) {
      this.Live.spectatorMode();
      return;
    }
    if (this.isPmode(false) !== 6 && this.isPmode(false) !== 9) {
      this.clearMatrix();
      if (this.isPmode(false) !== 9) {
        this.ModeManager.resetUI();
      }
    }
    this.gameEnded = false;
    this.Replay.clear();
    this.Replay.mode = 1;
    this.lastDAS = 0;
    this.firstDAS = true;
    this.lastHardDrop = 0;
    this.holdPressed = false;
    this.holdUsedAlready = false;
    this.hardDropPressed = false;
    this.comboCounter = -1;
    this.bigTriggered = false;
    this.botPlacement = null;
    this.botPlacementVisible = false;
    if (this.Bots) {
      this.Bots.clearTblOutlineTimer();
    }
    this.isBack2Back = false;
    this.lastHolePos = null;
    this.temporaryBlockSet = null;
    this.redrawHoldBox();
    this.deadline = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.activeBlock = new Block(0);
    this.place = null;
    this.frames = 0;
    this.timer = 0;
    this.clock = 0;
    this.redBar = 0;
    this.placedBlocks = 0;
    this.lastPlacements = [];
    this.totalFinesse = 0;
    this.totalKeyPresses = 0;
    this.finesse = 0;
    this.used180 = 0;
    this.incomingGarbage = [];
    this.solidToAdd = 0;
    this.solidHeight = 0;
    this.applyGravityLvl(this.R.gravityLvl);
    this.setLockDelay(this.R.lockDelay);
    this.setSpeedLimit(this.R.speedLimit);
    this.resetGameData();
    this.Items.onReset();
    this.soundQ.stop();
    if (this.isPmode(true) !== 9) {
      this.ModeManager.cleanup();
      this.GameStats.adjustToGameMode();
      this.blockInHold = null;
    }
    if (!this.isPmode(true)) {
      if (!this.livePmode) {
        this.generateLiveQueue();
      }
      this.Live.onReset();
      if (this.Bots) {
        this.Bots.onReset();
      }
      if (this.Live.liveMode !== 2 && this.Live.liveMode !== 3) {
        hideElem(this.rInfoBox);
      }
      this.Live.toggleMorePractice(true, false);
      if (this.R.ext === 1) {
        this.comboAttack = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4, 4, 4, 0];
        if (this.comboTableTimer) {
          clearTimeout(this.comboTableTimer);
        }
        this.comboTableTimer = setTimeout(() => {
          this.comboAttack = this.comboAttackDef;
          this.comboTableTimer = null;
        }, 20000);
      } else if (this.R.ext === 2) {
        this.comboAttack = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4, 4, 4, 0];
        this.linesAttack = [0, 0, 1, 2, 4, 4, 6, 2, 0, 4, 2];
        if (this.comboTableTimer) {
          clearTimeout(this.comboTableTimer);
        }
        this.comboTableTimer = setTimeout(() => {
          this.comboAttack = this.comboAttackDef;
          this.linesAttack = [0, 0, 1, 2, 4, 4, 6, 2, 0, 10, 2];
          this.comboTableTimer = null;
        }, 20000);
      }
    }
    if (this.isPmode(false)) {
      if (this.isPmode(false) === 3) {
        this.cheeseModeStart();
      } else if (this.isPmode(false) === 4) {
        this.lastGarbage = 0;
      }
    }
    if (this.Live.liveMode === 1 && !this.isPmode(true)) {
      for (
        var _0x5a96a9 = 0;
        _0x5a96a9 < this.cheeseHeight;
        _0x5a96a9++
      ) {
        this.addGarbage(1);
      }
    }
    if (this.softDrop) {
      if (this.isSoftDropFasterThanGravity()) {
        this.softDropSet(true, 0);
      } else {
        this.softDropSet(false, null);
      }
    }
    this.Caption.hide();
    if (this.focusState === 1) {
      this.Caption.outOfFocus();
    }
    this.GameStats.reorder();
    this.Settings.onGameStart();
    this.cancelSolid();
    this.getNextBlock();
    this.redrawBlocked = false;
    this.redraw();
    var _0x27f090 = this.timestamp();
    this.play = true;
    if (this.Replay.mode !== -1) {
      if (this.isPmode(false) !== 9) {
        this.Replay.mode = 0;
      } else {
        this.Replay.mode = 1;
      }
      if (this.transmitMode === 2) {
        this.Replay2 = new Replay2(this);
        this.Replay2.FULL_FRAME_INTERVAL = 5000;
      } else {
        this.Replay2 = null;
      }
    }
    this.Replay.config.softDropId = this.softDropId;
    this.Replay.config.gameStart = _0x27f090;
    this.Replay.config.bs = this.skinId;
    if (this.R.baseBlockSet) {
      this.Replay.config.bbs = this.R.baseBlockSet;
    }
    if (this.monochromeSkin) {
      this.Replay.config.bs = 7;
      this.Replay.config.mClr = this.monochromeSkin;
    }
    if (this.Settings.touchControlsEnabled) {
      this.Replay.config.touch = 1;
    }
    if (this.isInvisibleSkin) {
      this.Replay.config.bs += 100;
    }
    if (this.skinId >= 1000 && this.customSkinPath) {
      this.Replay.config.bp = this.customSkinPath.substring(0, 6);
    } else {
      delete this.Replay.config.bp;
    }
    this.Replay.config.se = this.Settings.SFXsetID;
    this.Replay.config.das = this.Settings.DAS;
    this.Replay.config.arr =
      this.Settings.ARR > 0 ? this.Settings.ARR : undefined;
    delete this.Replay.config.sc;
    this.Replay.onMoveAdded = this.onMove.bind(this);
    if (!this.isTabFocused) {
      this.play = false;
      this.lastSeen = _0x27f090;
      this.Replay.toggleAfkMode(true);
    }
    if (!this.isPmode(true)) {
      this.replayPartsSent = 0;
      this.replay2PartsSent = 0;
      this.Live.sendReplayConfig();
    }
    if (this.Replay2) {
      this.Replay2.onGameStart();
      this.Replay2.config.se = this.Settings.SFXsetID;
      this.Replay2.config.das = this.Settings.DAS;
      this.Replay2.config.arr =
        this.Settings.ARR > 0 ? this.Settings.ARR : undefined;
      this.Replay2.config.mClr = this.monochromeSkin;
      this.Replay2.config.touch = this.Settings.touchControlsEnabled;
    }
    if (this.DASmethod === 1) {
      this.evalDefferedDAS(null, _0x27f090);
    }
  }
};
Game.prototype.setFocusState = function (_0x3750c9) {
  this.focusState = _0x3750c9;
  if (_0x3750c9 === 1 && this.play) {
    this.Caption.outOfFocus();
  } else {
    this.Caption.hide(this.Caption.OUT_OF_FOCUS);
  }
};
Game.prototype.keyInput2 = function (_0x2d7914) {
  if (
    this.focusState === 0 &&
    this.Bots &&
    this.Bots.room &&
    this.Bots.room.tblRound
  ) {
    if (_0x2d7914.keyCode === 9) {
      _0x2d7914.preventDefault();
      this.Bots.cycleBotPlacementOutlineMode();
      return;
    }
    if (_0x2d7914.keyCode === 27) {
      _0x2d7914.preventDefault();
      this.Bots.room.forfeitRound();
      return;
    }
  }
  if (
    _0x2d7914.keyCode !== 113 &&
    (_0x2d7914.keyCode !== this.Settings.controls[9] ||
      (this.isPmode(false) === 9 &&
        this.ModeManager.isKeyPrevented(
          this.ModeManager.KEYDOWN,
          _0x2d7914,
        )))
  ) {
    if (
      _0x2d7914.keyCode !== 115 &&
      (_0x2d7914.keyCode !== this.Settings.controls[8] ||
        (this.isPmode(false) === 9 &&
          this.ModeManager.isKeyPrevented(
            this.ModeManager.KEYDOWN,
            _0x2d7914,
          )))
    ) {
      if (
        _0x2d7914.keyCode !== 13 ||
        (this.isPmode(false) === 9 &&
          this.ModeManager.preventedAllKeys)
      ) {
        if (
          _0x2d7914.keyCode >= 116 &&
          _0x2d7914.keyCode <= 123 &&
          this.isPmode(false) === 9 &&
          this.ModeManager.preventedAllKeys
        ) {
          return;
        }
      } else if (this.focusState !== 1) {
        this.setFocusState(1);
        this.Live.chatInput.focus();
      }
    } else {
      if (this.focusState === 1) {
        if (_0x2d7914.keyCode < 112 || _0x2d7914.keyCode > 123) {
          return;
        }
        this.canvas.focus();
        this.setFocusState(0);
      }
      if (_0x2d7914.keyCode >= 112 && _0x2d7914.keyCode <= 123) {
        _0x2d7914.preventDefault();
      }
      this.startPractice(this.selectedPmode);
      if (this.isPmode(false) === 9) {
        _0x2d7914.stopImmediatePropagation();
      }
    }
  } else {
    if (this.focusState === 1) {
      if (_0x2d7914.keyCode < 112 || _0x2d7914.keyCode > 123) {
        return;
      }
      this.canvas.focus();
      this.setFocusState(0);
    }
    if (_0x2d7914.keyCode >= 112 && _0x2d7914.keyCode <= 123) {
      _0x2d7914.preventDefault();
    }
    this.Live.sendRestartEvent();
  }
  if (
    this.focusState === 0 &&
    (_0x2d7914.keyCode === 38 ||
      _0x2d7914.keyCode === 40 ||
      _0x2d7914.keyCode === 32)
  ) {
    _0x2d7914.preventDefault();
  }
  if (
    (this.play || this.redrawBlocked || this.starting) &&
    this.focusState === 0
  ) {
    if (_0x2d7914.repeat) {
      _0x2d7914.preventDefault();
      return;
    }
    if (this.isPmode(false) === 9) {
      this.totalKeyPresses++;
      const _0xa0a960 = this.ModeManager.isKeyPrevented(
        this.ModeManager.KEYDOWN,
        _0x2d7914,
      );
      this.ModeManager.on(this.ModeManager.KEYDOWN, _0x2d7914);
      if (_0xa0a960) {
        _0x2d7914.preventDefault();
        _0x2d7914.stopPropagation();
        return false;
      }
    }
    if (this.starting) {
      if (_0x2d7914.keyCode === this.Settings.ml) {
        this.pressedDir[-1] = this.timestamp();
      } else if (_0x2d7914.keyCode === this.Settings.mr) {
        this.pressedDir[1] = this.timestamp();
      } else if (
        _0x2d7914.keyCode === this.Settings.sd &&
        !this.softDrop
      ) {
        this.softDropSet(true, null);
      }
      return;
    }
    if (_0x2d7914.keyCode === this.Settings.rl) {
      this.rotateCurrentBlock(-1);
      this.Replay.add(
        new ReplayAction(
          this.Replay.Action.ROTATE_LEFT,
          this.timestamp(),
        ),
      );
      this.lastAction = this.timestamp();
    } else if (_0x2d7914.keyCode === this.Settings.rr) {
      this.rotateCurrentBlock(1);
      this.Replay.add(
        new ReplayAction(
          this.Replay.Action.ROTATE_RIGHT,
          this.timestamp(),
        ),
      );
      this.lastAction = this.timestamp();
    } else if (_0x2d7914.keyCode === this.Settings.dr) {
      this.rotateCurrentBlock(2);
      this.Replay.add(
        new ReplayAction(
          this.Replay.Action.ROTATE_180,
          this.timestamp(),
        ),
      );
      this.lastAction = this.timestamp();
    } else if (
      _0x2d7914.keyCode !== this.Settings.ml ||
      this.pressedDir[-1]
    ) {
      if (
        _0x2d7914.keyCode !== this.Settings.mr ||
        this.pressedDir[1]
      ) {
        if (
          _0x2d7914.keyCode !== this.Settings.hk ||
          this.holdPressed
        ) {
          if (this.redrawBlocked) {
            return;
          }
          if (
            !this.hardDropPressed &&
            _0x2d7914.keyCode === this.Settings.hd &&
            this.isHardDropAllowed()
          ) {
            this.hardDropPressed = true;
            this.hardDrop(this.timestamp());
          } else if (
            _0x2d7914.keyCode === this.Settings.sd &&
            !this.softDrop
          ) {
            this.softDropSet(true, this.timestamp());
          }
        } else {
          this.holdBlock();
          this.holdPressed = true;
        }
      } else {
        _0x1ae756 = this.timestamp();
        this.moveCurrentBlock(1, false, _0x1ae756);
        this.pressedDir[1] = _0x1ae756;
        this.Replay.add(
          new ReplayAction(
            this.Replay.Action.MOVE_RIGHT,
            this.pressedDir[1],
          ),
        );
        if (this.Settings.DAScancel && this.pressedDir[-1]) {
          this.directionCancel(-1, -1);
        }
        if (this.DASmethod === 1) {
          this.setDASto(1, true, null);
        }
      }
    } else {
      var _0x1ae756 = this.timestamp();
      this.moveCurrentBlock(-1, false, _0x1ae756);
      this.pressedDir[-1] = _0x1ae756;
      this.Replay.add(
        new ReplayAction(
          this.Replay.Action.MOVE_LEFT,
          this.pressedDir[-1],
        ),
      );
      if (this.Settings.DAScancel && this.pressedDir[1]) {
        this.directionCancel(1, -1);
      }
      if (this.DASmethod === 1) {
        this.setDASto(-1, true, null);
      }
    }
    if (_0x2d7914.keyCode < 113 || _0x2d7914.keyCode > 123) {
      _0x2d7914.preventDefault();
      _0x2d7914.stopPropagation();
      return false;
    }
  }
};
Game.prototype.keyInput3 = function (_0xe9fed8) {
  if (this.isPmode(false) === 9) {
    const _0x386feb = this.ModeManager.isKeyPrevented(
      this.ModeManager.KEYUP,
      _0xe9fed8,
    );
    this.ModeManager.on(this.ModeManager.KEYUP, _0xe9fed8);
    if (_0x386feb) {
      return false;
    }
  }
  if (_0xe9fed8.keyCode === this.Settings.ml) {
    this.directionCancel(-1, false);
    if (this.pressedDir[1] === -1) {
      this.pressedDir[1] = this.timestamp();
    }
    if (this.DASmethod === 1) {
      this.setDASto(-1, false);
    }
  } else if (_0xe9fed8.keyCode === this.Settings.mr) {
    this.directionCancel(1, false);
    if (this.pressedDir[-1] === -1) {
      this.pressedDir[-1] = this.timestamp();
    }
    if (this.DASmethod === 1) {
      this.setDASto(1, false);
    }
  } else if (
    _0xe9fed8.keyCode === this.Settings.sd &&
    this.softDrop
  ) {
    this.softDropSet(false, this.timestamp());
  } else if (_0xe9fed8.keyCode === this.Settings.hk) {
    this.holdPressed = false;
  } else if (_0xe9fed8.keyCode === this.Settings.hd) {
    this.hardDropPressed = false;
  }
};
Game.prototype.directionCancel = function (_0x3aac2f, _0x3ec063) {
  if (_0x3aac2f === -1) {
    this.pressedDir[-1] = _0x3ec063;
    this.ARRon[-1] = false;
  } else {
    this.pressedDir[1] = _0x3ec063;
    this.ARRon[1] = false;
  }
  if (this.DASmethod === 1 && _0x3ec063 === false) {
    var _0x4d4f92 = _0x3aac2f === -1 ? 1 : -1;
    var _0x13f89f = this.timestamp();
    if (this.pressedDir[_0x4d4f92]) {
      if (this.Settings.DAScancel) {
        this.setDASto(_0x4d4f92, true, null);
      } else {
        this.evalDefferedDAS(_0x4d4f92, _0x13f89f);
      }
    }
  }
};
Game.prototype.evalDefferedDAS = function (_0x31bdef, _0x3be102) {
  if (_0x31bdef === null) {
    if (this.pressedDir[-1]) {
      _0x31bdef = -1;
    }
    if (
      this.pressedDir[1] &&
      (_0x31bdef === null || this.pressedDir[1] < this.pressedDir[-1])
    ) {
      _0x31bdef = 1;
    }
    if (_0x31bdef === null) {
      return;
    }
  } else if (!this.pressedDir[_0x31bdef]) {
    return;
  }
  var _0x30e5d2 = Math.max(
    0,
    this.getDAS() - (_0x3be102 - this.pressedDir[_0x31bdef]),
  );
  this.setDASto(_0x31bdef, true, _0x30e5d2);
};
Game.prototype.setDASto = function (_0x1ab33e, _0x479f06, _0x4c1969) {
  var _0x4e1449 = _0x4c1969 === null ? this.getDAS() : _0x4c1969;
  if (_0x479f06 || this.DASto[_0x1ab33e] === null) {
    if (_0x479f06 && this.DASto[_0x1ab33e] === null) {
      var _0x51224e = this;
      this.DASto[_0x1ab33e] = window.setTimeout(function () {
        _0x51224e.DASto[_0x1ab33e] = null;
        var _0x2a466d = _0x1ab33e === -1 ? 1 : -1;
        if (
          _0x51224e.lastDAS !== _0x1ab33e &&
          (_0x51224e.play || _0x51224e.animator !== null)
        ) {
          var _0x36300b = _0x51224e.timestamp();
          if (
            _0x51224e.pressedDir[_0x1ab33e] !== -1 &&
            (!(_0x51224e.pressedDir[-1] > 0) ||
              !(_0x51224e.pressedDir[1] > 0) ||
              !(
                _0x51224e.pressedDir[_0x2a466d] >
                _0x51224e.pressedDir[_0x1ab33e]
              ))
          ) {
            _0x51224e.activateDAS(_0x1ab33e, _0x36300b);
            if (_0x51224e.DASdebug && _0x4c1969 === null) {
              _0x51224e.plotForDASDebug(
                _0x36300b - _0x51224e.pressedDir[_0x1ab33e],
              );
            }
          }
        }
      }, _0x4e1449);
    }
  } else {
    window.clearTimeout(this.DASto[_0x1ab33e]);
    this.DASto[_0x1ab33e] = null;
  }
};
Game.prototype.redrawMatrix = function () {
  this.v.redrawMatrix();
};
Game.prototype.hasGhost = function () {
  if (this.R.ghost === undefined || this.R.ghost === -1) {
    return this.ghostEnabled;
  } else {
    return this.R.ghost === 1;
  }
};
Game.prototype.getDAS = function () {
  if (this.R.DAS === undefined || this.R.DAS === -1) {
    return this.Settings.DAS;
  } else {
    return this.R.DAS;
  }
};
Game.prototype.getARR = function () {
  if (this.R.ARR === undefined || this.R.ARR === -1) {
    return this.Settings.ARR;
  } else {
    return this.R.ARR;
  }
};
Game.prototype.resetDAS = function () {
  if (this.DASmethod === 1) {
    this.setDASto(-1, false, null);
    this.setDASto(1, false, null);
  }
  this.lastDAS = 0;
  this.firstDAS = true;
  this.ARRtime = 0;
  this.pressedDir[-1] = false;
  this.pressedDir[1] = false;
  this.ARRon[-1] = false;
  this.ARRon[1] = false;
  this.timer = 0;
  this.holdPressed = false;
  this.holdUsedAlready = false;
  this.hardDropPressed = false;
  this.comboCounter = -1;
};
Game.prototype.drawGhostAndCurrent = function () {
  var _0x33601b = this.blockSets[this.activeBlock.set];
  var _0x2b14ab =
    _0x33601b.scale === 1
      ? _0x33601b.blocks[this.activeBlock.id].blocks[
          this.activeBlock.rot
        ]
      : _0x33601b.previewAs.blocks[this.activeBlock.id].blocks[
          this.activeBlock.rot
        ];
  var _0x4223b5 = _0x2b14ab.length;
  this.drawScale = _0x33601b.scale;
  if (this.hasGhost() && !this.gameEnded) {
    for (var _0x15689f = 0; _0x15689f < _0x4223b5; _0x15689f++) {
      for (var _0x2a0176 = 0; _0x2a0176 < _0x4223b5; _0x2a0176++) {
        if (_0x2b14ab[_0x15689f][_0x2a0176] > 0) {
          this.v.drawGhostBlock(
            this.ghostPiece.pos.x + _0x2a0176 * this.drawScale,
            this.ghostPiece.pos.y + _0x15689f * this.drawScale,
            _0x33601b.blocks[this.activeBlock.id].color,
          );
          if (
            this.activeBlock.item &&
            _0x2b14ab[_0x15689f][_0x2a0176] === this.activeBlock.item
          ) {
            this.v.drawBrickOverlay(
              this.ghostPiece.pos.x + _0x2a0176 * this.drawScale,
              this.ghostPiece.pos.y + _0x15689f * this.drawScale,
              true,
            );
          }
        }
      }
    }
  }
  if (!this.gameEnded) {
    for (_0x15689f = 0; _0x15689f < _0x4223b5; _0x15689f++) {
      for (_0x2a0176 = 0; _0x2a0176 < _0x4223b5; _0x2a0176++) {
        if (_0x2b14ab[_0x15689f][_0x2a0176] > 0) {
          this.v.drawBlock(
            this.activeBlock.pos.x + _0x2a0176 * this.drawScale,
            this.activeBlock.pos.y + _0x15689f * this.drawScale,
            _0x33601b.blocks[this.activeBlock.id].color,
            0,
          );
          if (
            this.activeBlock.item &&
            _0x2b14ab[_0x15689f][_0x2a0176] === this.activeBlock.item
          ) {
            this.v.drawBrickOverlay(
              this.activeBlock.pos.x + _0x2a0176 * this.drawScale,
              this.activeBlock.pos.y + _0x15689f * this.drawScale,
              false,
            );
          }
        }
      }
    }
  }
  this.drawScale = 1;
};
Game.prototype.drawBotPlacement = function () {
  if (
    this.botPlacement &&
    this.botPlacementVisible &&
    !this.gameEnded
  ) {
    var _0x3ac62e = this.botPlacement;
    var _0xcb8502 = this.blockSets[_0x3ac62e.set];
    var _0x1f56b8 =
      _0xcb8502.scale === 1
        ? _0xcb8502.blocks[_0x3ac62e.pieceId].blocks[_0x3ac62e.rot]
        : _0xcb8502.previewAs.blocks[_0x3ac62e.pieceId].blocks[
            _0x3ac62e.rot
          ];
    var _0x1d5893 = _0x1f56b8.length;
    var _0x20fede = _0xcb8502.scale;
    var _0x46a36d = [];
    for (var _0xd1e8d1 = 0; _0xd1e8d1 < _0x1d5893; _0xd1e8d1++) {
      for (var _0x1c15dc = 0; _0x1c15dc < _0x1d5893; _0x1c15dc++) {
        if (_0x1f56b8[_0xd1e8d1][_0x1c15dc] > 0) {
          var _0x190d52 = _0x3ac62e.x + _0x1c15dc * _0x20fede;
          var _0x7d7aaa = _0x3ac62e.y + _0xd1e8d1 * _0x20fede;
          if (
            _0xd1e8d1 === 0 ||
            _0x1f56b8[_0xd1e8d1 - 1][_0x1c15dc] <= 0
          ) {
            _0x46a36d.push(
              _0x190d52,
              _0x7d7aaa,
              _0x190d52 + _0x20fede,
              _0x7d7aaa,
            );
          }
          if (
            _0xd1e8d1 === _0x1d5893 - 1 ||
            _0x1f56b8[_0xd1e8d1 + 1][_0x1c15dc] <= 0
          ) {
            _0x46a36d.push(
              _0x190d52,
              _0x7d7aaa + _0x20fede,
              _0x190d52 + _0x20fede,
              _0x7d7aaa + _0x20fede,
            );
          }
          if (
            _0x1c15dc === 0 ||
            _0x1f56b8[_0xd1e8d1][_0x1c15dc - 1] <= 0
          ) {
            _0x46a36d.push(
              _0x190d52,
              _0x7d7aaa,
              _0x190d52,
              _0x7d7aaa + _0x20fede,
            );
          }
          if (
            _0x1c15dc === _0x1d5893 - 1 ||
            _0x1f56b8[_0xd1e8d1][_0x1c15dc + 1] <= 0
          ) {
            _0x46a36d.push(
              _0x190d52 + _0x20fede,
              _0x7d7aaa,
              _0x190d52 + _0x20fede,
              _0x7d7aaa + _0x20fede,
            );
          }
        }
      }
    }
    this.v.drawOutline(_0x46a36d);
  }
};
Game.prototype.redraw = function () {
  if (!this.redrawBlocked) {
    this.redrawMatrix();
    this.drawGhostAndCurrent();
    this.drawBotPlacement();
    this.v.redrawRedBar(false);
    if (this.statsEnabled && this.statsMode === 1) {
      this.stats.update();
    }
    if (this.play && !this.gameEnded && this.Replay2) {
      this.Replay2.onMatrix(this.clock);
    }
  }
};
Game.prototype.redrawAll = function () {
  this.redraw();
  this.redrawHoldBox();
  this.updateQueueBox();
};
Game.prototype.updateLiveMatrix = function (
  _0x388b8b,
  _0x5408d1,
  _0x3bbd36,
) {
  var _0x59e37f = this.GS.slots[_0x388b8b].cid;
  if (
    !this.GS.extendedAvailable ||
    !!arrayContains(this.Live.bots, _0x59e37f) ||
    !this.Live.clients[_0x59e37f] ||
    this.Live.clients[_0x59e37f].rep === null
  ) {
    if (!this.GS.slots[_0x388b8b].v.g) {
      this.GS.slots[_0x388b8b].v.g = this;
    }
    this.GS.slots[_0x388b8b].v.updateLiveMatrix(_0x5408d1, _0x3bbd36);
  }
};
Game.prototype.playSound = function (_0x16de67, _0x4c6855) {
  if (this.SEenabled && this.R.sfx) {
    if (!_0x4c6855) {
      _0x4c6855 = 0;
    }
    var _0x423417 = this;
    var _0x4d0ca0 = false;
    function _0x5b7f0b(_0x2fb25b, _0x561b58) {
      if (!_0x2fb25b || !(_0x2fb25b in createjs.Sound._idHash)) {
        return;
      }
      let _0x49f5bd = createjs.Sound._idHash[_0x2fb25b].sndObj;
      if (_0x49f5bd && _0x49f5bd.q) {
        if (_0x49f5bd.q === 1 && !_0x4d0ca0) {
          _0x4d0ca0 = true;
          _0x423417.soundQ.stop();
        }
        _0x423417.soundQ.add(_0x2fb25b, _0x561b58);
      } else {
        createjs.Sound.play(_0x2fb25b).volume = _0x561b58;
      }
    }
    if (Array.isArray(_0x16de67)) {
      if (_0x4c6855 !== 2) {
        _0x16de67.forEach(function (_0x2ca87c) {
          _0x5b7f0b(_0x2ca87c, _0x423417.SFXset.volume);
        });
      }
      if (_0x4c6855 !== 1 && this.VSEenabled && this.R.vsfx) {
        _0x16de67.forEach(function (_0x49352a) {
          _0x5b7f0b("v_" + _0x49352a, _0x423417.VSFXset.volume);
        });
      }
    } else {
      if (_0x4c6855 !== 2) {
        _0x5b7f0b(_0x16de67, this.SFXset.volume);
      }
      if (_0x4c6855 !== 1 && this.VSEenabled && this.R.vsfx) {
        _0x5b7f0b("v_" + _0x16de67, this.VSFXset.volume);
      }
    }
  }
};
Game.prototype.moveCurrentBlock = function (
  _0x5c3260,
  _0x5475f0,
  _0x277198,
) {
  if (!_0x5475f0) {
    this.finesse++;
  }
  _0x5c3260 *= this.blockSets[this.activeBlock.set].step;
  return (
    !this.checkIntersection(
      this.activeBlock.pos.x + _0x5c3260,
      this.activeBlock.pos.y,
      null,
    ) &&
    ((this.activeBlock.pos.x = this.activeBlock.pos.x + _0x5c3260),
    (this.lastAction = _0x277198),
    this.updateGhostPiece(true),
    this.redraw(),
    _0x5475f0 || this.playSound("move"),
    true)
  );
};
var TBL_ALT_ROT = {
  0: {
    0: [
      {
        rot: 2,
        dx: 0,
        dy: -1,
      },
    ],
    1: [
      {
        rot: 3,
        dx: 1,
        dy: 0,
      },
    ],
    2: [
      {
        rot: 0,
        dx: 0,
        dy: 1,
      },
    ],
    3: [
      {
        rot: 1,
        dx: -1,
        dy: 0,
      },
    ],
  },
  1: {
    0: [
      {
        rot: 1,
        dx: 0,
        dy: 0,
      },
      {
        rot: 2,
        dx: 0,
        dy: 0,
      },
      {
        rot: 3,
        dx: 0,
        dy: 0,
      },
    ],
    1: [
      {
        rot: 0,
        dx: 0,
        dy: 0,
      },
      {
        rot: 2,
        dx: 0,
        dy: 0,
      },
      {
        rot: 3,
        dx: 0,
        dy: 0,
      },
    ],
    2: [
      {
        rot: 0,
        dx: 0,
        dy: 0,
      },
      {
        rot: 1,
        dx: 0,
        dy: 0,
      },
      {
        rot: 3,
        dx: 0,
        dy: 0,
      },
    ],
    3: [
      {
        rot: 0,
        dx: 0,
        dy: 0,
      },
      {
        rot: 1,
        dx: 0,
        dy: 0,
      },
      {
        rot: 2,
        dx: 0,
        dy: 0,
      },
    ],
  },
  5: {
    0: [
      {
        rot: 2,
        dx: 0,
        dy: -1,
      },
    ],
    1: [
      {
        rot: 3,
        dx: 1,
        dy: 0,
      },
    ],
    2: [
      {
        rot: 0,
        dx: 0,
        dy: 1,
      },
    ],
    3: [
      {
        rot: 1,
        dx: -1,
        dy: 0,
      },
    ],
  },
  6: {
    0: [
      {
        rot: 2,
        dx: 0,
        dy: -1,
      },
    ],
    1: [
      {
        rot: 3,
        dx: 1,
        dy: 0,
      },
    ],
    2: [
      {
        rot: 0,
        dx: 0,
        dy: 1,
      },
    ],
    3: [
      {
        rot: 1,
        dx: -1,
        dy: 0,
      },
    ],
  },
};
function showElem(_0x4b5f38) {
  if (_0x4b5f38) {
    _0x4b5f38.style.display = "block";
  }
}
function hideElem(_0x292d77) {
  if (_0x292d77) {
    _0x292d77.style.display = "none";
  }
}
function LineClearAnimator(_0x4fd3c3, _0x1295f2, _0x10ae0e) {
  this.g = _0x10ae0e;
  this.matrix = _0x4fd3c3;
  this.clearPositions = _0x1295f2;
  this.clearDelay = this.g.R.clearDelay / 1000;
  this.t = 0;
  this.IS_SOLID = true;
}
function Ctx2DView(_0x4e892c) {
  this.g = _0x4e892c;
  this.MAIN = 0;
  this.HOLD = 1;
  this.QUEUE = 2;
  this.NAME = "2d";
}
function FastFont2D() {
  this.fontSize = 16;
  this.canvas = document.getElementById("glstats");
  this.ctx = this.canvas.getContext("2d");
  this.availableLines = -1;
  this.resizeCanvas();
}
function WebGLUtils() {}
function WebGLView(_0x25cdad) {
  this.g = _0x25cdad;
  this.ctxs = [];
  this.MAIN = 0;
  this.HOLD = 1;
  this.QUEUE = 2;
  this.NAME = "webGL";
  this.colorsInTexture = [9, 8, 1, 2, 3, 4, 5, 6, 7];
  this.shaders = {
    vertex:
      "attribute vec4 a_position;     attribute vec2 a_texcoord;     uniform mat4 u_matrix;     uniform mat4 u_textureMatrix;     varying vec2 v_texcoord;     void main() {     gl_Position = u_matrix * a_position;     v_texcoord = (u_textureMatrix * vec4(a_texcoord, 0, 1)).xy;     }",
    fragment:
      "precision mediump float;     varying vec2 v_texcoord;     uniform sampler2D u_texture;     uniform float globalAlpha;     void main() {     gl_FragColor = texture2D(u_texture, v_texcoord);     gl_FragColor.rgb *= gl_FragColor.a * globalAlpha;     }",
  };
  this.videoSkin = false;
  this.video = null;
}
function FastFont() {
  this.fontSize = 16;
  this.sdfs = {
    0: {
      x: 0,
      y: 0,
    },
    1: {
      x: 20,
      y: 0,
    },
    2: {
      x: 40,
      y: 0,
    },
    3: {
      x: 60,
      y: 0,
    },
    4: {
      x: 80,
      y: 0,
    },
    5: {
      x: 100,
      y: 0,
    },
    6: {
      x: 120,
      y: 0,
    },
    7: {
      x: 140,
      y: 0,
    },
    8: {
      x: 160,
      y: 0,
    },
    9: {
      x: 180,
      y: 0,
    },
    "(": {
      x: 200,
      y: 0,
      w: 7,
    },
    ")": {
      x: 220,
      y: 0,
      w: 7,
    },
    "/": {
      x: 240,
      y: 0,
      w: 10,
    },
    "?": {
      x: 260,
      y: 0,
    },
    "-": {
      x: 280,
      y: 0,
    },
    "+": {
      x: 300,
      y: 0,
    },
    "∞": {
      x: 320,
      y: 0,
    },
    ".": {
      x: 340,
      y: 0,
      w: 7,
    },
    ":": {
      x: 360,
      y: 0,
      w: 7,
    },
    ",": {
      x: 380,
      y: 0,
      w: 7,
    },
    " ": {
      x: 400,
      y: 0,
      w: 4,
    },
  };
  this.shaders = {
    vertex:
      "attribute vec2 a_pos;     attribute vec2 a_texcoord;     uniform mat4 u_matrix;     uniform vec2 u_texsize;     varying vec2 v_texcoord;     void main() {     gl_Position = u_matrix * vec4(a_pos.xy, 0, 1);     v_texcoord = a_texcoord / u_texsize;     }",
    fragment:
      "precision mediump float;     uniform sampler2D u_texture;     uniform vec4 u_color;     uniform float u_buffer;     uniform float u_gamma;     varying vec2 v_texcoord;     void main() {     float dist = texture2D(u_texture, v_texcoord).r;     float alpha = smoothstep(u_buffer - u_gamma, u_buffer + u_gamma, dist);     gl_FragColor = vec4(u_color.rgb, alpha * u_color.a);     }",
  };
  var _0x4ad56d = (this.ctx = {});
  this.canvas = _0x4ad56d.elem = document.getElementById("glstats");
  var _0x3faad1 = (_0x4ad56d.gl = WebGLUtils.getWebGLcontext(
    _0x4ad56d.elem,
  ));
  _0x4ad56d.program = WebGLUtils.createProgram(
    _0x4ad56d.gl,
    this.shaders,
  );
  _0x3faad1.useProgram(_0x4ad56d.program);
  _0x3faad1.clearColor(0, 0, 0, 0);
  this.resizeCanvas();
  WebGLUtils.registerContextAttrUnifs(_0x3faad1, _0x4ad56d);
  _0x3faad1.enableVertexAttribArray(_0x4ad56d.a_pos);
  _0x3faad1.enableVertexAttribArray(_0x4ad56d.a_texcoord);
  _0x4ad56d.m4 = new Float32Array(16);
  this.MAX_STR_LEN = 11;
  this.verElem = new Float32Array(this.MAX_STR_LEN * 12);
  this.texElem = new Float32Array(this.MAX_STR_LEN * 12);
  _0x3faad1.blendFuncSeparate(
    _0x3faad1.SRC_ALPHA,
    _0x3faad1.ONE_MINUS_SRC_ALPHA,
    _0x3faad1.ONE,
    _0x3faad1.ONE,
  );
  _0x3faad1.enable(_0x3faad1.BLEND);
  _0x4ad56d.textureInfo = {
    texture: _0x3faad1.createTexture(),
  };
  _0x4ad56d.vertexBuffer = _0x3faad1.createBuffer();
  _0x4ad56d.textureBuffer = _0x3faad1.createBuffer();
  this.ready = false;
  this.scale = 16;
  this.gamma = 1.4;
  this.availableLines = 0;
  this.defaultGlyphW = 0.75;
  this.glParamsSet = false;
}
function GameCore(_0x5e4bb5) {
  this.ISGAME = _0x5e4bb5;
  this.randomizer = null;
  this.matrix = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];
  this.deadline = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  this.blockSets = getBlockSets();
  this.softDropSpeeds = [
    {
      id: 0,
      time: 0.05,
      steps: 0,
    },
    {
      id: 1,
      time: 0.008,
      steps: 0,
    },
    {
      id: 2,
      time: 0,
      steps: 1,
    },
    {
      id: 3,
      time: 0,
      steps: 2,
    },
    {
      id: 4,
      time: 0,
      steps: 20,
    },
  ];
  this.blockIds = {
    Z: 6,
    L: 3,
    O: 1,
    S: 5,
    I: 0,
    J: 4,
    T: 2,
  };
  this.queue = [
    new Block(0),
    new Block(0),
    new Block(0),
    new Block(0),
    new Block(0),
  ];
  this.queueLength = this.queue.length;
  this.gamedata = {
    lines: 0,
    singles: 0,
    doubles: 0,
    triples: 0,
    tetrises: 0,
    maxCombo: 0,
    linesSent: 0,
    linesReceived: 0,
    PCs: 0,
    lastPC: 0,
    TSD: 0,
    TSD20: 0,
    B2B: 0,
    attack: 0,
    score: 0,
    holds: 0,
    garbageCleared: 0,
    wasted: 0,
    tpieces: 0,
    tspins: 0,
  };
  this.skins = [
    {
      id: 0,
      name: "None",
      data: "",
    },
    {
      id: 1,
      name: "Default",
      data: "/res/b1.png",
      w: 32,
    },
    {
      id: 2,
      name: "Pixel",
      data: "/res/b2.png?v2",
      w: 32,
    },
    {
      id: 3,
      name: "Glass",
      data: "/res/b3.png?v2",
      w: 32,
    },
    {
      id: 4,
      name: "Gradient",
      data: "/res/b4.png?v2",
      w: 32,
    },
    {
      id: 5,
      name: "Nullpomino4",
      data: "/res/b5.png",
      w: 32,
    },
    {
      id: 6,
      name: "Invisible",
      data: "",
    },
    {
      id: 7,
      name: "Mono",
      data: "",
    },
    {
      id: 8,
      name: "Eyebites",
      data: "/res/b8.png",
      w: 32,
    },
    {
      id: 9,
      name: "Retro",
      data: "/res/b9.png",
      w: 32,
    },
    {
      id: 10,
      name: "Color Cubes",
      data: "/res/b10.png",
      w: 32,
    },
    {
      id: 11,
      name: "Simple",
      data: "/res/b11.png",
      w: 32,
    },
    {
      id: 12,
      name: "Color Blocks",
      data: "/res/b12.png",
      w: 32,
    },
    {
      id: 13,
      name: "Critter",
      data: "/res/b13.png",
      w: 32,
    },
  ];
  this.customSkinPath = null;
  this.temporaryBlockSet = null;
  this.blockInHold = null;
  this.spinPossible = false;
  this.spinMiniPossible = false;
  this.tspinMiniPossible = false;
  this.isBack2Back = false;
  this.wasBack2Back = false;
  this.isInvisibleSkin = false;
  this.monochromeSkin = false;
  this.cids = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  this.coffset = [0, 2, 3, 4, 5, 6, 7, 8, 1, 0];
  this.colors = [
    "black",
    "#D70F37",
    "#E35B02",
    "#E39F02",
    "#59B101",
    "#0F9BD7",
    "#2141C6",
    "#AF298A",
    "#999999",
    "#6A6A6A",
    "black",
    "white",
  ];
  this.colorsV3 = [
    [0, 0, 0],
    [215, 15, 55],
    [227, 91, 2],
    [227, 159, 2],
    [89, 177, 1],
    [15, 155, 215],
    [33, 65, 198],
    [175, 41, 138],
    [153, 153, 153],
    [106, 106, 106],
    [0, 0, 0],
    [255, 255, 255],
  ];
  for (
    var _0x35c7e2 = 0;
    _0x35c7e2 < this.colorsV3.length;
    ++_0x35c7e2
  ) {
    for (var _0x4af1be = 0; _0x4af1be < 3; ++_0x4af1be) {
      this.colorsV3[_0x35c7e2][_0x4af1be] /= 255;
    }
  }
  this.NullCol = [
    "black",
    "#E4203E",
    "#E47E30",
    "#E3CF3C",
    "#1DE03D",
    "#00C9DF",
    "#0042DC",
    "#9E2CDC",
    "#999999",
    "#585858",
    "black",
    "white",
  ];
  this.multipleNames = [
    "Single",
    "Double",
    "Triple",
    "Quadruple",
    "Multiple",
  ];
  this.excludedBlocksAS = [];
  this.Items = new Items(this);
  this.R = this.DEF = {
    clearDelay: 0,
    rnd: 0,
    showPreviews: 5,
    holdEnabled: true,
    baseBlockSet: 0,
    gravityLvl: 1,
    lockDelay: [500, 5000, 20000],
    mess: 0,
    gapW: 1,
    gInv: false,
    gDelay: 500,
    gblock: 0,
    tsdOnly: false,
    allSpin: 0,
    speedLimit: 0,
    scoreMult: 1,
    ghost: -1,
    DAS: -1,
    ARR: -1,
    clearLines: true,
    sfx: true,
    vsfx: true,
    solidAttack: false,
    ext: 0,
    sgProfile: [0, 3],
    infHold: false,
  };
  this.initRandomizer(this.R.rnd);
}
function Bag(_0x394b17, _0x460b20, _0x50a152) {
  this.RNG = _0x394b17;
  this.usebag = [];
  for (let _0x17d065 = 0; _0x17d065 < _0x460b20; _0x17d065++) {
    for (let _0x21c434 = 0; _0x21c434 < _0x50a152; _0x21c434++) {
      this.usebag.push(_0x17d065);
    }
  }
  this.bag = this.usebag.slice(0);
}
function Classic(_0x307fe9, _0x3794ab) {
  this.RNG = _0x307fe9;
  this.n = _0x3794ab;
}
function OneBlock(_0x1360a8, _0x167ca9, _0x402185, _0x377295) {
  this.RNG = _0x1360a8;
  this.n = _0x167ca9;
  this.bag = [];
  if (_0x377295) {
    let _0x2c2e12 = new Bag(_0x1360a8, _0x167ca9, _0x377295);
    for (let _0x5378cb = 0; _0x5378cb < _0x402185; ++_0x5378cb) {
      this.bag.push(_0x2c2e12.getBlock().id);
    }
  } else {
    for (let _0x2c4408 = 0; _0x2c4408 < _0x402185; _0x2c4408++) {
      let _0x49d0cc;
      do {
        _0x49d0cc = Math.floor(this.RNG() * this.n);
      } while (this.bag.indexOf(_0x49d0cc) !== -1);
      this.bag.push(_0x49d0cc);
    }
  }
  this.lastIndex = 0;
}
function C2Sim(_0xd3559e, _0x356374) {
  this.RNG = _0xd3559e;
  this.n = _0x356374;
  this.hist = [-1, -2];
}
function Repeated(_0x398272, _0x543b77) {
  this.randomizer = _0x398272;
  this.n = _0x543b77;
  this.block = null;
  this.i = 0;
  this.nextSegment();
}
function BsBlock(_0x54764d, _0xfe9a6e) {
  this.randomizer = _0x54764d;
  this.bsArr = _0xfe9a6e;
  this.i = 0;
}
function BigBlockRand(_0x187b0e, _0xf6f337) {
  this.randomizer = _0x187b0e;
  this.bsArr = _0xf6f337;
  this.i = 0;
  this.EXPECTED_BLOCKS = 5000;
}
function ConstBlock(_0x2d210f, _0x500bf2) {
  this.id = _0x2d210f;
  this.set = _0x500bf2;
}
function Live(_0x357a45) {
  this.version = "v1.40.1";
  this.serverScheme = conf_global.srvScheme;
  this.tryProxy = conf_global.revProxy;
  this.server = conf_global.srv;
  this.port = conf_global.port;
  this.authorized = conf_global.name !== "";
  this.authReady = true;
  this.connected = false;
  this.sitout = false;
  this.socket = null;
  this.p = _0x357a45;
  this.cid = 0;
  this.conAttempts = 0;
  this.MAX_CONN_ATTEMPTS = 2;
  this.sTier = 0;
  this.isProxy = false;
  this.servers = null;
  this.serverId = null;
  this.joinRemote = null;
  this.createRoomRequest = null;
  this.connectionTimeout = null;
  this.wasConnected = false;
  this.clients = {};
  this.players = Array();
  this.bots = Array();
  this.authList = Array();
  this.places = {};
  this.notPlaying = [];
  this.rid = "";
  this.rc = 0;
  this.rcS = {};
  this.roomConfig = null;
  this.gid = 0;
  this.roundSeed = "";
  this.lastGameId = "";
  this.currentTarget = 0;
  this.winnerCID = undefined;
  this.iAmHost = false;
  this.xbufferEnabled = false;
  this.xbuffer = {};
  this.urlPlayParamApplied = false;
  this.msgCount = 0;
  this.chatBox = document.getElementById("ch1");
  this.friendsBox = document.getElementById("ch2");
  this.chatArea = document.getElementById("chatContent");
  this.friendsBtn = document.getElementById("frLobby");
  this.chatInput = document.getElementById("chatInput");
  this.chatInputArea = document.getElementById("chatInputArea");
  this.chatButton = document.getElementById("sendMsg");
  this.resetButton = document.getElementById("res");
  this.resetProgress = document.createElement("span");
  this.resetProgress.classList.add("btn-progress");
  this.resetButton.appendChild(this.resetProgress);
  this.resetProgress.style.width = "0%";
  this.teamOptions = document.getElementById("team-options");
  this.tsArea = document.getElementById("tsArea");
  this.myTeam = document.getElementById("myTeam");
  this.resultsBox = document.getElementById("resultsBox");
  this.resultsContent = document.getElementById("resultsContent");
  this.moreResults = document.getElementById("moreResults");
  this.moreData = document.getElementById("moreData");
  this.saveLink = document.getElementById("saveLink");
  this.moreVisible = false;
  this.statsSent = true;
  this.lobbyVisible = false;
  this.lobbyInfoShown = false;
  this.chatAtBottom = true;
  this.lobbyBox = document.getElementById("lobbyBox");
  this.lobbyContent = document.getElementById("lobbyContent");
  this.refreshLobbyButton = document.getElementById("refreshLobby");
  this.setupLobbyHandlers();
  this.RoomInfo = new RoomInfo(this);
  this.adjustForCustomLayout();
  this.editRoomButton = document.getElementById("editRoomButton");
  this.createRoomDialog = document.getElementById("createRoom");
  this.roomNameInput = document.getElementById("roomName");
  this.roomName = null;
  this.isPrivateInput = document.getElementById("isPrivate");
  this.chatName = conf_global.name;
  this.chatButton.textContent = i18n.sendButton;
  this.roomJoinTimes = {};
  this.LiveGameRunning = true;
  this.liveMode = 0;
  this.pingSent = 0;
  this.emoteAutocomplete = new ChatAutocomplete(
    this.chatInput,
    this.chatInputArea,
    ":",
    null,
  );
  this.emoteAutocomplete.minimalLengthForHint = 3;
  this.nameAutocomplete = new ChatAutocomplete(
    this.chatInput,
    this.chatInputArea,
    "@",
    function () {
      return arrayUnique(
        Object.values(this.clients).map(function (_0x5f4242) {
          return _0x5f4242.name;
        }),
      );
    }.bind(this),
  );
  this.nameAutocomplete.prefixInSearch = false;
  let _0xe96caf = new _jstrisx();
  this.sessX = _0xe96caf.get();
  this.hostStartMode = false;
  this.noFourWide = 0;
  this.solidAfter = 0;
  this.liveSeed = "";
  this.liveMap = null;
  this.liveModeId = null;
  this.umLoadingPhase = false;
  this.livePmodeTypes = [1, 1];
  this.team = null;
  this.teamSwitchDisabled = false;
  this.teamButtons = {};
  this.gdm = 0;
  this.gdms = [
    "targets",
    "divide",
    "toAll",
    "toLeast",
    "toMost",
    "toSelf",
    "random",
    "roulette",
  ];
  this.gDelay = 500;
  this.sgProfile = 0;
  this.playingOfflineWarningShown = false;
  this.loadMapForOpponents = false;
  this.Friends = new Friends(this);
  this.p.Caption.loading(i18n.connecting);
}
function Client(_0x2ad06d) {
  this.cid = _0x2ad06d;
  this.type = 0;
  this.rep = null;
  this.name = null;
  this.mod = false;
  this.auth = false;
  this.color = null;
  this.icon = null;
}
function RoomInfo(_0x1e086e) {
  this.l = _0x1e086e;
  this.roomDetailBox =
    this.timeoutRequestDetail =
    this.timeoutRoomDetail =
      null;
  this.rdParts = {};
  this.roomDetails = {};
  this.ON_OFF = [i18n.off, i18n.on];
  this.CONF_NAMES = {
    at: "Attack table",
    ct: "Combo table",
    ld: "Lock delay",
    cd: {
      n: "Clear delay",
      u: "ms",
    },
    DAS: {
      n: "DAS",
      u: "ms",
    },
    ARR: {
      n: "ARR",
      u: "ms",
    },
    gdm: {
      n: "G-distrib.",
      v: [
        null,
        "divide",
        "toAll",
        null,
        "toMost",
        "toSelf",
        "random",
        "roulette",
      ],
    },
    gblock: {
      n: "G-blocking",
      v: ["full", "limited", "none", "instant"],
    },
    rnd: {
      n: "Randomizer",
      v: [
        "7bag",
        "14bag",
        "Classic",
        "1Block",
        "2Block",
        "1x7bag",
        "1x14bag",
        "C2Sim",
        "7b-RR",
        "BSb-7b",
        "BB-7b",
      ],
    },
    pr: "Previews",
    hold: "Hold",
    bbs: {
      n: "Blocks",
      v: [
        null,
        "Big",
        "Big2",
        "ARS",
        "Penta",
        "M123",
        "All29",
        "C2RS",
        "OSpin",
      ],
    },
    grav: "Gravity",
    mess: {
      n: "Messiness",
      u: "%",
    },
    gDelay: {
      n: "G-delay",
      u: "ms",
    },
    hostStart: "HostStart",
    gInv: "G-invert",
    gapW: "G-gap",
    noFW: "noFW",
    ghost: {
      n: "Ghost",
      v: {
        "-1": "Def",
        0: "Off",
        1: "On",
      },
    },
    sa: "SolidAtk",
    as: {
      n: "AllSpin",
      v: [i18n.off, i18n.on + " - Im.", i18n.on + " - 4P"],
    },
    asEx: "AS-Excl.",
    sgp: {
      n: "Solid",
      v: ["0", "1", "2", "Custom speed"],
    },
  };
  this.LIMIT_NAMES = {
    apm: {
      n: i18n.APM,
      u: "",
    },
    sub: {
      n: i18n.sprint,
      u: i18n.s,
    },
    gt: {
      n: i18n.gTimeShort,
      u: i18n.hrs,
    },
  };
}
function Settings(_0x2657b5) {
  this.p = _0x2657b5;
  this.box = document.getElementById("settingsBox");
  this.touchEnabledBox = document.getElementById("touch");
  this.soundEnabledBox = document.getElementById("esound");
  this.DMsoundBox = document.getElementById("DMsound");
  this.SEEnabledBox = document.getElementById("SE");
  this.VSEEnabledBox = document.getElementById("vSE");
  this.sfxSelect = document.getElementById("sfxSelect");
  this.vsfxSelect = document.getElementById("vsfxSelect");
  this.SEStartEnabledBox = document.getElementById("SEstart");
  this.SErotateEnabledBox = document.getElementById("SErot");
  this.SEFaultEnabledBox = document.getElementById("SEfault");
  this.monoColorInp = document.getElementById("monoColor");
  this.statOptId = document.getElementById("statOptId");
  this.settingBoxes = Array();
  this.settingBoxes[1] = document.getElementById("DAS");
  this.settingBoxes[2] = document.getElementById("ARR");
  this.settingsSaveBtn = document.getElementById("settingsSave");
  this.settingsSaveBtn.onclick = this.closeSettings.bind(this);
  this.settingsResetBtn = document.getElementById("settingsReset");
  this.settingsResetBtn.onclick = this.resetSettings.bind(this);
  this.mainDiv = document.getElementById("main");
  this.moreSkins = null;
  this.skinsLoaded = false;
  this.inputBoxes = Array();
  for (var _0x5413fa = 1; _0x5413fa <= 10; _0x5413fa++) {
    this.inputBoxes[_0x5413fa] = document.getElementById(
      "input" + _0x5413fa,
    );
    this.inputBoxes[_0x5413fa].onkeydown = this.onControlKeySet.bind(
      this,
      _0x5413fa,
    );
  }
  this.webGlStartFailed = false;
  this.BAN_ARTIFACT_KEY = "room3";
  this.mc = new Hammer(this.mainDiv);
  this.mc.set({
    enable: false,
    touchAction: "auto",
  });
  this.preventZoomHandler = this.preventZoom;
  this.touchActuallyUsed = false;
  this.monochromePicker = this.registerColorPicker();
  this.gamepadFound = false;
  this.statGameModeSelect = document.getElementById(
    "statGameModeSelect",
  );
  this.statGameModeSelect.onchange =
    this.onStatGameModeChange.bind(this);
  this.statCheckboxes = Array();
  for (
    _0x5413fa = 1;
    _0x5413fa <=
    document.getElementsByClassName("statCheckbox").length;
    _0x5413fa++
  ) {
    this.statCheckboxes[_0x5413fa] = document.getElementById(
      "stat" + _0x5413fa,
    );
    this.statCheckboxes[_0x5413fa].onchange =
      this.onStatCheckboxChange.bind(this, _0x5413fa);
  }
}
function soundCredits(_0x6b6cf0) {
  var _0x38b98b;
  var _0x5d0e4e;
  var _0x1116ab;
  if (_0x6b6cf0.srcElement.id == "sfxSelect") {
    _0x38b98b = "soundDesc";
    _0x5d0e4e = "audioCred";
    _0x1116ab = SFXsets;
  } else {
    _0x38b98b = "soundDesc2";
    _0x5d0e4e = "audioCred2";
    _0x1116ab = VSFXsets;
  }
  var _0x4ec679 = document.getElementById(_0x38b98b);
  var _0x4891fb = document.getElementById(_0x5d0e4e);
  0;
  var _0xad4a2d = new _0x1116ab[
    parseInt(_0x6b6cf0.srcElement.value)
  ].data();
  if (_0xad4a2d.author) {
    _0x4ec679.style.display = "table-row";
    _0x4891fb.innerHTML = _0xad4a2d.author;
  } else {
    hideElem(_0x4ec679);
  }
}
function GameSlots(_0x18927a) {
  this.p = _0x18927a;
  this.gsDiv = document.getElementById("gameSlots");
  this.chatBox = document.getElementById("chatBox");
  this.chatArea = document.getElementById("chatContent");
  this.chatExp = document.getElementById("chatExpand");
  this.resultsBox = document.getElementById("resultsBox");
  this.lobbyBox = document.getElementById("lobbyBox");
  this.w = this.gsDiv.offsetWidth;
  this.h = this.gsDiv.offsetHeight;
  this.slotHeight = this.matrixHeight = 0;
  this.slotWidth = this.matrixWidth = 0;
  this.zoom = 1;
  this.isFullscreen = false;
  this.forceExtended = false;
  this.slotStats = false;
  document.getElementById("fsSlots").checked = this.isFullscreen;
  document.getElementById("hqSlots").checked = this.forceExtended;
  document.getElementById("zoomControl").value = 100;
  this.cidSlots = {};
  this.nameFontSize = 15;
  this.nameHeight = 18;
  this.redBarWidth = 5;
  this.slots = [];
  this.targetSlotId = -1;
  this.shownSlots = 0;
  this.extendedView = [1, 2, 4];
  this.isExtended = false;
  this.extendedAvailable = true;
  this.skinOverride = false;
  this.baseSize = {
    playersW: 450,
    playersH: 450,
    gameFrame: 1091,
  };
  this.rowCount = 0;
  this.liveBlockSize = 10;
  this.holdQueueBlockSize = 10;
  this.blocksY = 20;
  this.chatExpanded = false;
  this.resultsShown = false;
  this.setup(6);
  this.teamTags = [];
  this.tagHeight = 20;
  this.teamData = null;
  this.teamMembers = {};
}
function Slot(_0x4c4945, _0x6c55f1, _0x146b69, _0x5698fc) {
  this.gs = _0x5698fc;
  this.id = _0x4c4945;
  this.cid = -1;
  this.x = _0x6c55f1;
  this.y = _0x146b69;
  this.pCan = document.createElement("canvas");
  this.bgCan = document.createElement("canvas");
  this.holdCan = document.createElement("canvas");
  this.queueCan = document.createElement("canvas");
  this.pCan.classList.add("layer", "mainLayer");
  this.bgCan.classList.add("layer", "bgLayer");
  this.holdCan.classList.add("layer", "mp-holdCan");
  this.queueCan.classList.add("layer", "mp-queueCan");
  this.name = document.createElement("span");
  this.slotDiv = document.createElement("div");
  this.stageDiv = document.createElement("div");
  this.stats = new SlotStats(this, this.gs);
  var _0xbcdf0e = {
    main: this.pCan,
    bg: this.bgCan,
    hold: this.holdCan,
    queue: this.queueCan,
  };
  this.v = new SlotView(_0xbcdf0e);
  this.v.g = this.gs.p;
  this.v.slot = this;
  this.init();
}
function SlotStats(_0x1f746b, _0x4d48e7) {
  this.slot = _0x1f746b;
  this.gs = _0x4d48e7;
  this.statsDiv = document.createElement("div");
  this.statsDiv.classList.add("stat", "unsel");
  this.pps = document.createElement("span");
  this.apm = document.createElement("span");
  this.ppsTitle = document.createElement("span");
  this.apmTitle = document.createElement("span");
  var _0x2ec1e1 = document.createElement("div");
  _0x2ec1e1.classList.add("statLine");
  var _0x27d4a4 = document.createElement("div");
  _0x27d4a4.classList.add("statLine");
  this.winCounter = document.createElement("span");
  this.winCounter.classList.add("wins");
  this.apmTitle.classList.add("ti");
  this.ppsTitle.classList.add("ti");
  this.winCounter.classList.add("ti");
  this.ppsTitle.textContent = "PPS";
  this.apmTitle.textContent = "APM";
  this.winCounter.textContent = "0";
  this.pps.textContent = this.apm.textContent = "0.00";
  _0x2ec1e1.appendChild(this.ppsTitle);
  _0x2ec1e1.appendChild(this.pps);
  _0x27d4a4.appendChild(this.apmTitle);
  _0x27d4a4.appendChild(this.apm);
  this.statsDiv.appendChild(_0x2ec1e1);
  this.statsDiv.appendChild(_0x27d4a4);
  this.statsDiv.appendChild(this.winCounter);
}
function SlotView(_0x21b334) {
  this.g = null;
  this.slot = null;
  this.MAIN = 0;
  this.HOLD = 1;
  this.QUEUE = 2;
  this.canvas = _0x21b334.main;
  this.ctx = this.canvas.getContext("2d");
  this.bgCanvas = _0x21b334.bg;
  this.bgctx = this.bgCanvas.getContext("2d");
  this.holdCanvas = _0x21b334.hold;
  this.hctx = this.holdCanvas.getContext("2d");
  this.queueCanvas = _0x21b334.queue;
  this.qctx = this.queueCanvas.getContext("2d");
  this.block_size = 24;
  this.holdQueueBlockSize = 24;
  this.drawScale = 1;
  this.isKO = false;
  this.KOplace = null;
  this.QueueHoldEnabled = false;
  this.SEenabled = false;
  this.replaySEset = 0;
  this.tex = new Image();
  this.skinId = 0;
  this.ghostSkinId = 0;
  this.skinWidth = 32;
  this.redrawBlocked = false;
  this.ghostEnabled = true;
}
function StatsManager(_0x235305) {
  this.stats = {};
  this.ordered = [];
  this.dirty = false;
  this.labelsElem = document.getElementById("statLabels");
  this.shown =
    _0x235305.g.Settings.shownStats[_0x235305.g.isPmode(false)];
  this.initDefault();
  this.setView(_0x235305);
}
function StatLine(_0x2c4d01, _0x2f588d, _0x1798e4) {
  this.id = _0x2c4d01;
  this.order = _0x1798e4;
  this.manager = null;
  this.enabled = false;
  this.label = document.createElement("span");
  this.label.textContent = _0x2f588d;
  this.initialVal = this.value = "0";
  this.resets = true;
  this.locked = false;
}
function GameCaption(_0x26c8cf) {
  this.parent = _0x26c8cf;
  this.captions = {};
  this.SPECTATOR_MODE = 1;
  this.OUT_OF_FOCUS = 2;
  this.READY_GO = 3;
  this.GAME_PLACE = 4;
  this.SPEED_LIMIT = 5;
  this.MAP_LOADING = 6;
  this.NEW_PERSONAL_BEST = 7;
  this.LOADING = 8;
  this.RACE_FINISHED = 9;
  this.GAME_WARNING = 10;
  this.MODE_INFO = 11;
  this.MODE_COMPLETE = 12;
  this.PAUSED = 13;
  this.BUTTON = 14;
  this.speedTimout = null;
}
function Mobile(_0x231424) {
  this.p = _0x231424;
  this.isMobile = this.isMobile();
  this.Settings = this.p.Settings;
  this.showPlBtn = null;
  this.draggingEnabled = false;
  if (this.isMobile) {
    this.initForMobile();
  }
}
function ReplayAction(_0x4b7372, _0x372559) {
  this.a = _0x4b7372;
  this.t = _0x372559;
}
function Replay() {
  this.Action = Object.freeze({
    MOVE_LEFT: 0,
    MOVE_RIGHT: 1,
    DAS_LEFT: 2,
    DAS_RIGHT: 3,
    ROTATE_LEFT: 4,
    ROTATE_RIGHT: 5,
    ROTATE_180: 6,
    HARD_DROP: 7,
    SOFT_DROP_BEGIN_END: 8,
    GRAVITY_STEP: 9,
    HOLD_BLOCK: 10,
    GARBAGE_ADD: 11,
    SGARBAGE_ADD: 12,
    REDBAR_SET: 13,
    ARR_MOVE: 14,
    AUX: 15,
  });
  this.AUX = Object.freeze({
    AFK: 0,
    BLOCK_SET: 1,
    MOVE_TO: 2,
    RANDOMIZER: 3,
    MATRIX_MOD: 4,
    WIDE_GARBAGE_ADD: 5,
  });
  this.AuxBits = Array();
  this.AuxBits[this.Action.GARBAGE_ADD] = [5, 4];
  this.AuxBits[this.Action.REDBAR_SET] = [5];
  this.AuxBits[this.Action.ARR_MOVE] = [1];
  this.AuxBits[this.Action.AUX] = [4];
  this.config = {
    v: 3.3,
    softDropId: undefined,
    gameStart: undefined,
    gameEnd: undefined,
    seed: undefined,
    m: undefined,
    bs: undefined,
    se: undefined,
    das: undefined,
    arr: undefined,
  };
  this.actions = Array();
  this.string = "";
  this.md5 = "";
  this.mode = 0;
  this.isAfkMode = false;
  this.afkQueue = [];
  this.stream = new ReplayStream();
  this.onSaved = null;
  this.onMoveAdded = null;
}
function _arrayBufferToBase64(_0x52b4f7) {
  var _0x56e18f = "";
  var _0xcb1318 = new Uint8Array(_0x52b4f7);
  if (endianness()) {
    var _0x28c4ba = _0xcb1318.byteLength / 4;
    for (var _0x203750 = 0; _0x203750 < _0x28c4ba; _0x203750++) {
      for (var _0x33a630 = 0; _0x33a630 < 4; _0x33a630++) {
        _0x56e18f += String.fromCharCode(
          _0xcb1318[_0x203750 * 4 + 3 - _0x33a630],
        );
      }
    }
  } else {
    _0x28c4ba = _0xcb1318.byteLength;
    for (_0x203750 = 0; _0x203750 < _0x28c4ba; _0x203750++) {
      _0x56e18f += String.fromCharCode(_0xcb1318[_0x203750]);
    }
  }
  return window.btoa(_0x56e18f);
}
function endianness() {
  var _0x4075ad = new ArrayBuffer(4);
  var _0x373aa7 = new Uint32Array(_0x4075ad);
  var _0x52c804 = new Uint8Array(_0x4075ad);
  _0x373aa7[0] = 3735928559;
  if (_0x52c804[0] === 239) {
    return 1;
  }
  if (_0x52c804[0] === 222) {
    return 0;
  }
  alert("Unknown endianness!");
  throw new Error("Aborted");
}
function ReplayStream() {
  this.data = [0];
  this.datapos = 0;
  this.bitpos = 0;
  this.wordSize = 32;
  this.byte = 0;
}
function RulesetManager(_0x51df80) {
  this.p = _0x51df80;
  this.modeMenu = document.getElementById("mode-menu");
  this.DEF = _0x51df80.DEF;
  this.pmodeRuleId = 0;
  this.RULE_KEYS = {
    cd: "clearDelay",
    rnd: "rnd",
    pr: "showPreviews",
    hold: "holdEnabled",
    bbs: "baseBlockSet",
    grav: "gravityLvl",
    ld: "lockDelay",
    mess: "mess",
    gapW: "gapW",
    gInv: "gInv",
    gDelay: "gDelay",
    gblock: "gblock",
    tsdOnly: "tsdOnly",
    as: "allSpin",
    sl: "speedLimit",
    sm: "scoreMult",
    ghost: "ghost",
    DAS: "DAS",
    ARR: "ARR",
    cl: "clearLines",
    sfx: "sfx",
    vsfx: "vsfx",
    sa: "solidAttack",
    ext: "ext",
    sgpA: "sgProfile",
    infHold: "infHold",
  };
  this.PRESET_KEYS = {
    clearDelay: "clearDelay",
    rndSel: "rnd",
    prSel: "showPreviews",
    hasHold: "holdEnabled",
    blocksSel: "baseBlockSet",
    gravityLvl: "gravityLvl",
    lockDelay: "lockDelay",
    mess: "mess",
    gapW: "gapW",
    gInv: "gInv",
    garbageDelay: "gDelay",
    gblockSel: "gblock",
    tsdOnly: "tsdOnly",
    allSpin: "allSpin",
    speedLimit: "speedLimit",
    scoreMult: "scoreMult",
    ghost: "ghost",
    DAS: "DAS",
    ARR: "ARR",
    clearLines: "clearLines",
    sfx: "sfx",
    vsfx: "vsfx",
    solidAtk: "solidAttack",
    sgProfile: "sgpA",
    infHold: "infHold",
  };
  this.RULESETS = [
    {
      id: 0,
      lvl: 1,
      name: "Default",
      key: "",
      desc: "Normal settings",
      c: {},
    },
    {
      id: 1,
      lvl: 1,
      name: "Big mode",
      key: "big",
      desc: "Blocks are larger than normal",
      c: {
        bbs: 1,
      },
    },
    {
      id: 2,
      lvl: 3,
      name: "Pentomino",
      key: "pentomino",
      desc: "Pentomino blocks",
      c: {
        bbs: 4,
      },
    },
    {
      id: 3,
      lvl: 2,
      name: "MPH",
      key: "MPH",
      desc: "Memoryless, previewless, holdless",
      c: {
        pr: 0,
        hold: false,
        rnd: 2,
      },
    },
  ];
  this.MODES = [
    {
      id: 1,
      n: i18n.sprint,
      modes: [
        {
          id: 2,
          n: "20",
          fn: "20L",
          rs: [0, 2, 3],
        },
        {
          id: 1,
          n: "40",
          fn: "40L",
          rs: [0, 1, 2, 3],
        },
        {
          id: 3,
          n: "100",
          fn: "100L",
          rs: [0, 1, 2, 3],
        },
        {
          id: 4,
          n: "1K",
          fn: "1000L",
          rs: [0, 1, 2, 3],
        },
      ],
    },
    {
      id: 3,
      n: i18n.cheese,
      modes: [
        {
          id: 1,
          n: "10",
          fn: "10L",
          rs: [0, 2, 3],
        },
        {
          id: 2,
          n: "18",
          fn: "18L",
          rs: [0, 3],
        },
        {
          id: 3,
          n: "100",
          fn: "100L",
          rs: [0, 3],
        },
        {
          id: 100,
          n: "&infin;",
          rs: [0, 2, 3],
        },
      ],
    },
    {
      id: 4,
      n: i18n.survival,
      modes: [
        {
          id: 1,
          n: "1g/s",
          rs: [0],
        },
      ],
    },
    {
      id: 5,
      n: i18n.ultra,
      modes: [
        {
          id: 1,
          n: "2min",
          rs: [0, 2, 3],
        },
      ],
    },
    {
      id: 7,
      n: i18n["20TSD"],
      modes: [
        {
          id: 1,
          n: "",
          rs: [0, 3],
        },
      ],
    },
    {
      id: 8,
      n: i18n.PCmode,
      modes: [
        {
          id: 1,
          n: "",
          rs: [0, 3],
        },
      ],
    },
    {
      id: 2,
      n: i18n.freePlay,
      modes: [
        {
          id: 1,
          n: "",
          rs: [0, 1, 2, 3],
        },
      ],
    },
  ];
  this.combo = null;
  this.isOpen = false;
  this.rs1 = document.getElementById("ruleSel1");
  this.registerCombo();
}
function Items(_0x3e529d) {
  this.p = _0x3e529d;
  this.itmBox = document.getElementsByClassName("itmBox")[0];
  this.itmIcn = document.getElementsByClassName("itmIcn")[0];
  this.itmTxt = document.getElementsByClassName("itmTxt")[0];
  this.itmDef = [
    null,
    {
      id: 1,
      n: "Tblocks",
      i: "/res/img/i/tpieces.png",
      m: 0.24,
      p: 0.12,
    },
    {
      id: 2,
      n: "Tornado",
      i: "/res/img/i/tornado.png",
      m: 0.22,
      p: 0.22,
    },
    {
      id: 3,
      n: "Compress",
      i: "/res/img/i/compress.png",
      m: 0.2,
      p: 0.06,
    },
    {
      id: 4,
      n: "Fourwide",
      i: "/res/img/i/four.png",
      m: 0.04,
      p: 0.06,
    },
    {
      id: 5,
      n: "Poison",
      i: "/res/img/i/poison.png",
      m: 0.003,
      p: 0.03,
    },
    {
      id: 6,
      n: "Pentomino",
      i: "/res/img/i/pento.png",
      m: 0.107,
      p: 0.06,
    },
    {
      id: 7,
      n: "Big",
      i: "/res/img/i/big.png",
      m: 0.13,
      p: 0.06,
    },
    {
      id: 8,
      n: "Invert",
      i: "/res/img/i/invert.png",
      m: 0.02,
      p: 0.06,
    },
    {
      id: 9,
      n: "Mystery",
      i: "/res/img/i/unknown.png",
      m: 0,
      p: 0.3,
    },
    {
      id: 10,
      n: "Win",
      i: "/res/img/i/win.png",
      m: 0,
      p: 0,
    },
    {
      id: 11,
      n: "B1",
      i: "/res/img/i/dot.png",
      m: 0.04,
      p: 0.03,
    },
    {
      id: 12,
      n: "Big2",
      i: "/res/img/i/big.png",
      m: 0,
      p: 0,
    },
  ];
  this.item = null;
  this.key = 87;
  this.origBBS = null;
  this.P1 = 200;
  this.fs = false;
  this.f = null;
  this.isPriv = false;
  this.active = [];
  this.preload = [];
  var _0x506df4 = new Date();
  this.dom = parseInt(_0x506df4.getDate());
}
function InvertAnimator(_0x3ca16a, _0x268c43) {
  this.items = _0x3ca16a;
  this.g = _0x268c43;
  this.matrix = _0x268c43.matrix;
  this.tmpMatrix = copyMatrix(_0x268c43.matrix);
  this.items.invertMatrix();
  this.PER_ROUND = 0.1;
  this.hadGhost = this.g.ghostEnabled;
  this.i = 0;
  this.d = 0;
  this.g.ghostEnabled = false;
  this.g.redraw();
}
function PoisonAnimator(_0x2e4458, _0x46cc33) {
  this.items = _0x2e4458;
  this.g = _0x46cc33;
  this.matrix = _0x46cc33.matrix;
  this.PER_ROUND = 0.06;
  this.hadGhost = this.g.ghostEnabled;
  this.i = 0;
  this.d = 0;
  this.g.setCurrentPieceToDefaultPos();
  this.g.updateGhostPiece(true);
  this.g.ghostEnabled = false;
}
function CompressAnimator(_0x2e55c2, _0xa48945) {
  this.items = _0x2e55c2;
  this.g = _0xa48945;
  this.matrix = _0xa48945.matrix;
  this.PER_ROUND = 0.06;
  this.hadGhost = this.g.ghostEnabled;
  this.i = 0;
  this.d = 0;
  this.g.setCurrentPieceToDefaultPos();
  this.g.updateGhostPiece(true);
  this.g.ghostEnabled = false;
}
function WindAnimator(_0x216f0a, _0x105fe0, _0x5c8f73) {
  this.items = _0x216f0a;
  this.g = _0x105fe0;
  this.i = _0x5c8f73;
  this.matrix = _0x105fe0.matrix;
  this.PER_ROUND = 0.06;
  this.d = 0;
  this.hadGhost = this.g.ghostEnabled;
  this.g.setCurrentPieceToDefaultPos();
  this.g.updateGhostPiece(true);
  this.g.ghostEnabled = false;
}
function ItemActivation(_0x4fe05d) {
  this.id = _0x4fe05d;
  this.hd = 0;
}
function Friends(_0x4084e8) {
  this.Live = _0x4084e8;
  this.socket = null;
  this.uri = null;
  this.jwt = null;
  this.reconnects = 0;
  this.forcedReconDelay = 0;
  this.pendingStatus = null;
  this.friendsOpened = false;
  this.friendsCount = null;
  this.openChatName = null;
  this.friends = null;
  this.Live.friendsBtn.onclick = this.openFriends.bind(this);
  this.chatBox = document.getElementById("chatBox");
  this.notifElem = null;
  this.chatHeader = null;
  this.dmChatBackButton = null;
  this.unreadChannels = {};
  this.lastNotifSound = null;
  this.friendsError = null;
  this.statusData = null;
  this.VIEW_MODE = {
    FRIEND_LIST_LOADING: 0,
    NO_FRIENDS: 1,
    FRIEND_LIST: 2,
    TOO_MANY_CONN: 3,
    LOGIN_FIRST: 4,
    INTRO: 5,
  };
  this.viewIntro();
}
function ChatAutocomplete(
  _0x41a69d,
  _0x320fc8,
  _0x21d375,
  _0x349713,
) {
  this.inp = _0x41a69d;
  this.hintParent = _0x320fc8;
  this.prfx = _0x21d375;
  this.hints = _0x349713;
  this.hintsImg = null;
  if (_0x349713 === null) {
    this.initEmoteHints();
  }
  this.prefixInSearch = true;
  this.maxPerHint = 10;
  this.minimalLengthForHint = 1;
  this.addEmoteSurrounder = ":";
  this.wipePrevious = false;
  this.onWiped = null;
  this.preProcessEmotes = null;
  this.onEmoteObjectReady = null;
  this.moreEmotesAdded = false;
  this.selectedIndex = 0;
  this.hintsElem = document.createElement("div");
  this.hintsElem.classList.add("chatHints");
  hideElem(this.hintsElem);
  this.hintParent.appendChild(this.hintsElem);
  this.init();
}
function Matrix() {}
function EmoteSelect(
  _0x2069b4,
  _0x56048f,
  _0x3cf860,
  _0x499ac4,
  _0x1cda3c,
  _0x56d1a,
) {
  this.input = _0x2069b4;
  this.emoteIndex = _0x56048f;
  this.container = _0x3cf860;
  this.openBtn = _0x499ac4;
  this.path = _0x1cda3c;
  this.groupEmotes = _0x56d1a;
  this.init();
}
Game.prototype.beforeHardDrop = function (_0x42d743) {
  if (this.botPlacement) {
    if (!this.ghostEnabled) {
      this.updateGhostPiece(true);
    }
    var _0x462a80 = this.botPlacement;
    if (
      this.activeBlock.id !== _0x462a80.pieceId ||
      this.activeBlock.set !== _0x462a80.set
    ) {
      this._rejectTblPlacement(_0x42d743);
      return;
    }
    if (
      this.activeBlock.rot === _0x462a80.rot &&
      this.ghostPiece.pos.x === _0x462a80.x &&
      this.ghostPiece.pos.y === _0x462a80.y
    ) {
    } else {
      if (
        _0x462a80.set !== 0 ||
        !TBL_ALT_ROT[_0x462a80.pieceId] ||
        !TBL_ALT_ROT[_0x462a80.pieceId][_0x462a80.rot]
      ) {
        this._rejectTblPlacement(_0x42d743);
        return;
      }
      var _0x548514 = TBL_ALT_ROT[_0x462a80.pieceId][_0x462a80.rot];
      var _0x4cccc5 = false;
      for (
        var _0x11ee77 = 0;
        _0x11ee77 < _0x548514.length;
        _0x11ee77++
      ) {
        var _0x329c13 = _0x548514[_0x11ee77];
        if (
          this.activeBlock.rot === _0x329c13.rot &&
          this.ghostPiece.pos.x === _0x462a80.x + _0x329c13.dx &&
          this.ghostPiece.pos.y === _0x462a80.y + _0x329c13.dy
        ) {
          _0x4cccc5 = true;
          break;
        }
      }
      if (!_0x4cccc5) {
        this._rejectTblPlacement(_0x42d743);
        return;
      }
    }
    if (_0x462a80.botQueueSnapshot) {
      var _0x29b799 = _0x462a80.botQueueSnapshot;
      var _0x33f97c = this.timestamp();
      this.incomingGarbage = [];
      var _0x30ab94 = 0;
      for (
        var _0x2e9865 = 0;
        _0x2e9865 < _0x29b799.applied.length;
        _0x2e9865++
      ) {
        this.incomingGarbage.push([
          _0x29b799.applied[_0x2e9865][0],
          0,
        ]);
        _0x30ab94 += _0x29b799.applied[_0x2e9865][0];
      }
      for (
        var _0x337fb8 = 0;
        _0x337fb8 < _0x29b799.unapplied.length;
        _0x337fb8++
      ) {
        this.incomingGarbage.push([
          _0x29b799.unapplied[_0x337fb8][0],
          _0x33f97c,
        ]);
        _0x30ab94 += _0x29b799.unapplied[_0x337fb8][0];
      }
      this.redBar = _0x30ab94;
      this.v.redrawRedBar(true);
    }
  }
  if (this.Bots) {
    this.Bots.onHardDrop();
  }
  if (this.bigTriggered && this.Live.LiveGameRunning && !this.pmode) {
    this.bigTriggered = false;
    var _0x4d269f = new ReplayAction(
      this.Replay.Action.AUX,
      _0x42d743,
    );
    _0x4d269f.d = [this.Replay.AUX.BLOCK_SET, 0, 2];
    this.Replay.add(_0x4d269f);
    this.temporaryBlockSet = 2;
  }
};
Game.prototype._rejectTblPlacement = function (_0x426a1b) {
  this.hdAbort = true;
  this.setCurrentPieceToDefaultPos();
  this.updateGhostPiece(true);
  this.lockDelayActive = false;
  this.timer = 0;
  this.lastGeneration = _0x426a1b;
  if (this.Bots) {
    this.Bots.onPlacementRejected();
  }
};
Game.prototype.hardDrop = function (_0xe14579) {
  this.beforeHardDrop(_0xe14579);
  if (this.hdAbort) {
    this.hdAbort = false;
    return;
  }
  this.lastHardDrop = this.clock;
  this.Replay.add(
    new ReplayAction(this.Replay.Action.HARD_DROP, _0xe14579),
  );
  var _0x31c6da = this.blockSets[this.activeBlock.set];
  var _0x23bb34 =
    this.activeBlock.pos.x +
    _0x31c6da.blocks[this.activeBlock.id].cc[this.activeBlock.rot];
  var _0x3ad41b =
    this.finesse -
    (_0x31c6da.finesse !== null
      ? _0x31c6da.finesse[this.activeBlock.id][this.activeBlock.rot][
          _0x23bb34
        ]
      : 0);
  if (_0x3ad41b > 0) {
    this.totalFinesse += _0x3ad41b;
    if (this.pmode === 1 && this.Settings.restartSprintOnFF) {
      this.GameOver();
      this.startPractice(1);
    }
  }
  this.totalKeyPresses += this.finesse - this.used180;
  this.used180 = 0;
  this.finesse = 0;
  if (!this.ghostEnabled) {
    this.updateGhostPiece(true);
  }
  const _0x1c5a2c = this.ghostPiece.pos.y;
  const _0x2259cf = _0x1c5a2c - this.activeBlock.pos.y;
  if (this.spinPossible && _0x1c5a2c !== this.activeBlock.pos.y) {
    this.spinPossible = false;
  }
  if (
    this.isPmode(false) === 9 &&
    ((this.activeBlock.pos.x = this.ghostPiece.pos.x),
    (this.activeBlock.pos.y = _0x1c5a2c),
    this.ModeManager.on(this.ModeManager.BEFORE_LOCK),
    this.ModeManager.preventLock)
  ) {
    this.lockDelayActive = false;
    this.lastGeneration = _0xe14579;
    return;
  }
  this.score(this.Scoring.A.HARD_DROP, _0x2259cf);
  this.GameStats.get("FINESSE").set(this.totalFinesse);
  this.placeBlock(this.ghostPiece.pos.x, _0x1c5a2c, _0xe14579);
  this.botPlacement = null;
  this.redraw();
  if (this.isPmode(false) === 9) {
    this.ModeManager.on(this.ModeManager.BLOCK, this.placedBlocks);
  }
  if (this.SEenabled && this.play) {
    if (_0x3ad41b > 0 && this.SEFaultEnabled) {
      this.playSound("fault");
    } else {
      this.playSound(this.hardDropPressed ? "harddrop" : "lock");
    }
  }
};
Game.prototype.isSoftDropFasterThanGravity = function () {
  return (
    this.R.gravityLvl <= 1 ||
    this.softDropSpeeds[this.softDropId].time /
      (this.softDropSpeeds[this.softDropId].steps + 1) <
      this.baseGravity[0] / this.baseGravity[1]
  );
};
Game.prototype.softDropSet = function (_0x20d9b1, _0x555fc3) {
  let _0xa24516 = false;
  if (_0x20d9b1 === true) {
    if (this.isSoftDropFasterThanGravity()) {
      this.softDrop = true;
      this.currentGravity[0] =
        this.softDropSpeeds[this.softDropId].time;
      this.currentGravity[1] =
        this.softDropSpeeds[this.softDropId].steps;
      _0xa24516 = true;
      this.timer = 0;
    }
  } else {
    _0xa24516 = this.softDrop;
    this.softDrop = false;
    this.currentGravity = this.baseGravity.slice(0);
    this.timer = 0;
  }
  if (_0x555fc3 !== null && _0xa24516) {
    this.Replay.add(
      new ReplayAction(
        this.Replay.Action.SOFT_DROP_BEGIN_END,
        _0x555fc3,
      ),
    );
  }
};
Game.prototype.GameOver = function () {
  if (!this.gameEnded || this.play) {
    this.paintMatrixWithColor(9);
    this.gameEnded = true;
    this.play = false;
    if (!this.isPmode(true)) {
      this.sendRepFragment();
      this.sendReplay2Fragment();
      this.Live.sendGameOverEvent();
      this.getPlace(false, true);
      var _0x1555df = !this.Replay.hasUserInputs();
      if (this.isPmode(false) === 9) {
        _0x1555df = this.totalKeyPresses < 2;
      }
      if (_0x1555df) {
        if (++this.inactiveGamesCount == 2) {
          this.Live.showInChat("", i18n.inactive1);
        } else {
          this.Live.showInChat(
            "<span style='color:yellow'>" + i18n.warning + "</span>",
            i18n.inactive2,
          );
        }
      }
    }
    if (this.isPmode(false)) {
      if (this.isPmode(false) !== 1) {
        if (this.isPmode(true) === 4) {
          this.Live.sendGameModeResult(this.Replay);
        } else if (this.isPmode(true) === 7) {
          this.practiceModeCompleted();
        } else if (this.isPmode(true) === 9) {
          this.ModeManager.saveScore(false);
        }
      }
    }
    this.Live.onGameEnd();
    if (this.Bots) {
      this.Bots.onPlayerTopout();
    }
    this.Settings.onGameEnd();
    this.Items.reset();
    this.ModeManager.cleanup();
    this.updateTextBar();
    this.playSound("died");
    this.GS.setTarget(-1);
    this.cancelSolid();
  }
};
Game.prototype.generatePracticeQueue = function (_0x2a4320) {
  var _0x1e0808 = 0;
  do {
    var _0x822dcd = this.RNG().toString(36).substring(7);
    this.blockRNG = alea(_0x822dcd);
    this.Replay.config.seed = _0x822dcd;
    this.initRandomizer(_0x2a4320);
    this.generateQueue();
  } while (
    ++_0x1e0808 < 1000 &&
    this.isBannedStartSequence(this.queue, false)
  );
};
Game.prototype.getAdjustedLiveSeed = function (_0x3d1359) {
  var _0x594684 = 0;
  var _0x5cbba1 = [];
  var _0x4bfb51 = _0x3d1359;
  do {
    _0x3d1359 =
      _0x4bfb51 + (_0x594684 === 0 ? "" : _0x594684.toString(36));
    let _0x2a728a = alea(_0x3d1359);
    let _0x5c60d1 = this.randomizerFactory(
      this.conf[0].rnd,
      _0x2a728a,
    );
    _0x5cbba1 = this.getQueuePreview(_0x5c60d1);
  } while (
    ++_0x594684 < 1000 &&
    this.isBannedStartSequence(_0x5cbba1, true)
  );
  return _0x3d1359;
};
Game.prototype.isBannedStartSequence = function (
  _0x68108b,
  _0x45fe85,
) {
  _0x68108b = _0x68108b || this.queue;
  let _0x2cf643 = _0x45fe85
    ? this.Live.liveMode === 3
      ? this.Live.livePmodeTypes[0]
      : this.livePmode
    : this.pmode;
  let _0x265839 = _0x45fe85
    ? this.conf[0].baseBlockSet
    : this.conf[1].baseBlockSet;
  return (
    _0x68108b.length >= 2 &&
    _0x265839 <= 3 &&
    (!_0x45fe85 || this.conf[0].rnd === 0) &&
    ((_0x2cf643 === 1 &&
      (_0x68108b[0].id >= 5 ||
        (_0x68108b[0].id === 1 && _0x68108b[1].id >= 5))) ||
      (_0x2cf643 !== 2 &&
        _0x68108b[0].id >= 5 &&
        _0x68108b[1].id >= 5))
  );
};
Game.prototype.refillQueue = function () {
  if (
    (this.isPmode(false) !== 6 ||
      this.MapManager.mapData.queue == null) &&
    (this.isPmode(false) !== 9 || !this.ModeManager.noQueueRefill)
  ) {
    let _0x24fe48 = this.getRandomizerBlock();
    0;
    this.queue.push(_0x24fe48);
  }
};
Game.prototype.getNextBlock = function (_0x3a8233) {
  _0x3a8233 = _0x3a8233 || this.timestamp();
  this.lockDelayActive = false;
  this.lastGeneration = _0x3a8233;
  this.activeBlock = this.getBlockFromQueue();
  this.setCurrentPieceToDefaultPos();
  this.updateGhostPiece(true);
  this.checkAutoRepeat(_0x3a8233, false);
  if (
    !this.isPmode(true) &&
    this.transmitMode === 0 &&
    this.snapRate <= 1000 &&
    _0x3a8233 - this.lastSnapshot > this.snapRate / 4
  ) {
    this.sendSnapshot();
    this.lastSnapshot = _0x3a8233;
  }
  if (this.VSEenabled && this.VSFXset.spawns) {
    this.playCurrentPieceSound();
  }
  this.timer = 0;
};
Game.prototype.playCurrentPieceSound = function () {
  this.playSound(
    "b_" +
      this.blockSets[this.activeBlock.set].blocks[this.activeBlock.id]
        .name,
  );
};
Game.prototype.practiceModeCompleted = function (_0x1c7fd3) {
  _0x1c7fd3 = _0x1c7fd3 || this.timestamp();
  this.play = false;
  this.gameEnded = true;
  this.Replay.config.gameEnd = _0x1c7fd3;
  this.updateTextBar();
  this.paintMatrixWithColor(9);
  hideElem(this.sprintInfo);
  showElem(this.practiceMenu);
  if (this.isPmode(true) !== 2) {
    if (this.livePmode) {
      if (this.Bots && this.Bots.mode == 1) {
        this.Bots.onPracticeModeCompleted();
        showElem(this.botMenu);
        hideElem(this.practiceMenu);
      } else if (
        this.livePmode !== 9 ||
        this.ModeManager.isRaceMode
      ) {
        this.Live.raceCompleted();
      } else {
        this.Live.sendGameOverEvent();
        this.getPlace(false, true);
      }
    } else if (this.pmode && this.pmode !== 9) {
      this.Live.sendGameModeResult(this.Replay);
    }
  }
};
Game.prototype.frame = function () {
  let _0x1857c0 = this.timestamp();
  this.update(Math.min(1, (_0x1857c0 - this.last) / 1000), _0x1857c0);
  this.last = _0x1857c0;
  if (this.statsEnabled && this.statsMode === 0) {
    this.stats.update();
  }
  window.requestAnimFrame(this.frame.bind(this), this.canvas);
};
Game.prototype.run = function () {
  this.last = this.timestamp();
  this.frame();
};
Game.prototype.onMove = function (_0x28c0a9) {
  if (
    _0x28c0a9.a !== this.Replay.Action.DAS_LEFT &&
    _0x28c0a9.a !== this.Replay.Action.DAS_RIGHT
  ) {
    this.lastDAS = 0;
  } else if (this.firstDAS) {
    this.firstDAS = false;
  }
};
Game.prototype.checkAutoRepeat = function (_0xbd14b2, _0x25044a) {
  let _0x15a328 = false;
  let _0x3e176d = false;
  if (!_0x25044a && !this.redrawBlocked) {
    _0x3e176d = true;
    this.redrawBlocked = true;
  }
  if (this.pressedDir[-1] > 0 && this.pressedDir[1] > 0) {
    _0x15a328 =
      this.pressedDir[-1] > this.pressedDir[1]
        ? this.autoRepeat(-1, this.pressedDir[-1], _0xbd14b2)
        : this.autoRepeat(1, this.pressedDir[1], _0xbd14b2);
  } else if (this.pressedDir[-1] > 0) {
    _0x15a328 = this.autoRepeat(-1, this.pressedDir[-1], _0xbd14b2);
  } else if (this.pressedDir[1] > 0) {
    _0x15a328 = this.autoRepeat(1, this.pressedDir[1], _0xbd14b2);
  }
  if (!_0x25044a && _0x3e176d) {
    this.redrawBlocked = false;
  }
  return _0x15a328;
};
Game.prototype.autoRepeat = function (
  _0x2eba14,
  _0x4a0e99,
  _0x57d95e,
) {
  if (
    this.DASmethod === 1 &&
    this.ARRon[_0x2eba14] &&
    !this.getARR()
  ) {
    return this.activateDAS(_0x2eba14, _0x57d95e);
  }
  if (this.getARR() && this.ARRon[_0x2eba14]) {
    if (
      _0x57d95e - this.ARRtime >= this.getARR() &&
      ((this.ARRtime = _0x57d95e),
      this.moveCurrentBlock(_0x2eba14, true, _0x57d95e))
    ) {
      var _0x38bfaa = new ReplayAction(
        this.Replay.Action.ARR_MOVE,
        _0x57d95e,
      );
      _0x38bfaa.d = [_0x2eba14 === -1 ? 0 : 1];
      this.Replay.add(_0x38bfaa);
      return true;
    }
  } else if (
    this.DASmethod === 0 &&
    _0x57d95e - _0x4a0e99 >= this.getDAS() &&
    this.lastDAS !== _0x2eba14
  ) {
    if (this.DASdebug && !this.ARRon[_0x2eba14]) {
      this.plotForDASDebug(_0x57d95e - _0x4a0e99);
    }
    return this.activateDAS(_0x2eba14, _0x57d95e);
  }
  return false;
};
Game.prototype.plotForDASDebug = function (_0x30e80f) {
  if (!this.firstDAS) {
    var _0x2162c2 = Math.max(0, _0x30e80f - this.getDAS());
    this.statsDASPanel.update(_0x2162c2, 32);
  }
};
Game.prototype.activateDAS = function (_0x3d68d1, _0x4a9f92) {
  this.ARRon[_0x3d68d1] = true;
  this.lastDAS = _0x3d68d1;
  if (this.getARR() === 0) {
    if (this.moveBlockToTheWall(_0x3d68d1)) {
      this.Replay.add(
        new ReplayAction(
          _0x3d68d1 === -1
            ? this.Replay.Action.DAS_LEFT
            : this.Replay.Action.DAS_RIGHT,
          _0x4a9f92,
        ),
      );
      return true;
    }
  } else {
    this.ARRtime = _0x4a9f92;
  }
  return false;
};
Game.prototype.update = function (_0x34c044, _0x54c51d) {
  this.frames++;
  if (this.v.videoSkin) {
    if (this.v.videoOpts.fpsUpdate) {
      this.v.updateTexture(0);
    }
    this.redrawAll();
  }
  if (this.Settings.gamepadFound) {
    this.Settings.processGamepad();
  }
  if (this.animator !== null) {
    this.animator.render(_0x34c044);
  }
  if (this.play) {
    this.timer += _0x34c044;
    this.clock += _0x34c044;
    if (this.timer >= this.currentGravity[0]) {
      this.timer = this.timer - this.currentGravity[0];
      var _0x469f18 = this.gravityStep(
        this.currentGravity[1],
        _0x54c51d,
      );
      if (_0x469f18) {
        if (this.softDrop || _0x469f18 === 1) {
          this.Replay.add(
            new ReplayAction(
              this.Replay.Action.GRAVITY_STEP,
              _0x54c51d,
            ),
          );
          if (this.softDrop) {
            this.score(this.Scoring.A.SOFT_DROP, _0x469f18);
          }
        } else {
          var _0x127fab = new ReplayAction(
            this.Replay.Action.AUX,
            _0x54c51d,
          );
          _0x127fab.d = [
            this.Replay.AUX.MOVE_TO,
            this.activeBlock.pos.x,
            this.activeBlock.pos.y,
          ];
          this.Replay.add(_0x127fab);
        }
      }
      this.redraw();
    }
    this.checkAutoRepeat(_0x54c51d, true);
    if (this.lockDelayActive) {
      if (_0x54c51d - this.lastAction >= this.lockDelay) {
        if (
          this.checkIntersection(
            this.activeBlock.pos.x,
            this.activeBlock.pos.y + 1,
            null,
          )
        ) {
          this.hardDrop(_0x54c51d);
        } else if (
          this.pmode ||
          (this.solidInterval === null && !this.solidToAdd)
        ) {
          this.lockDelayActive = false;
        }
      }
      if (
        _0x54c51d - this.lockDelayActivated >=
        this.maxLockDelayWithoutLock
      ) {
        this.hardDrop(_0x54c51d);
      }
    }
    if (!this.isPmode(true)) {
      if (
        this.transmitMode === 1 &&
        _0x54c51d - this.lastSnapshot > this.liveSnapRate
      ) {
        this.sendRepFragment();
        this.lastSnapshot = _0x54c51d;
        if (++this.fragmentCounter >= 10) {
          this.fragmentCounter = 0;
          this.sendSnapshot();
        }
      } else if (
        this.transmitMode === 2 &&
        _0x54c51d - this.lastSnapshot > this.liveSnapRate
      ) {
        this.sendReplay2Fragment();
        this.lastSnapshot = _0x54c51d;
      } else if (
        this.transmitMode === 0 &&
        _0x54c51d - this.lastSnapshot > this.snapRate
      ) {
        this.sendSnapshot();
        this.lastSnapshot = _0x54c51d;
      }
    }
    if (
      this.isPmode(false) === 4 &&
      this.clock - this.lastGarbage > 1
    ) {
      var _0x153402 = this.clock - this.lastGarbage - 1;
      this.addAsyncGarbage(1);
      this.redraw();
      this.lastGarbage = this.clock - _0x153402;
    } else if (this.isPmode(false) === 5) {
      var _0x557e7d = Math.ceil(
        this.ultraModes[this.sprintMode] - this.clock,
      );
      if (_0x557e7d < this.linesRemaining) {
        this.linesRemaining = _0x557e7d;
        this.lrem.textContent = sprintTimeFormat(
          this.linesRemaining,
          -1,
        );
      }
      if (this.linesRemaining <= 0) {
        this.practiceModeCompleted(_0x54c51d);
      }
    } else if (
      this.isPmode(false) === 9 &&
      this.ModeManager.timeTriggers.length
    ) {
      let _0x465b5e = this.ModeManager.timeTriggers[0];
      if (this.clock >= _0x465b5e.t) {
        this.ModeManager.execCommands(_0x465b5e.c);
        this.ModeManager.timeTriggers.shift();
      }
    }
    if ((this.frames & 7) == 7 || this.GameStats.dirty) {
      this.updateTextBar();
    }
    if ((this.frames & 31) == 31) {
      if (!this.pmode && (this.frames & 63) == 63) {
        this.Live.changeTarget();
      }
      if (_0x54c51d - this.lastGeneration >= this.maxWithoutLock) {
        this.hardDrop(_0x54c51d);
      }
      var _0x55f67e = this.solidHeight + this.solidToAdd;
      if (!this.pmode && _0x55f67e !== this.maxWithoutLock) {
        var _0x20bc75 = Math.max(
          2500,
          this.maxWithoutLock -
            _0x55f67e * (this.maxWithoutLock / 10),
        );
        if (_0x54c51d - this.lastGeneration > _0x20bc75) {
          this.hardDrop(_0x54c51d);
        }
      }
    }
  }
  if (
    this.Live.xbufferEnabled &&
    (this.frames & this.xbuffMask) === this.xbuffMask
  ) {
    for (
      var _0x29b2b2 = 0;
      _0x29b2b2 < this.GS.shownSlots;
      _0x29b2b2++
    ) {
      var _0x2f02ca = this.GS.slots[_0x29b2b2].cid;
      if (this.Live.xbuffer.hasOwnProperty(_0x2f02ca)) {
        var _0x29339f = this.Live.xbuffer[_0x2f02ca];
        this.updateLiveMatrix(_0x29b2b2, _0x29339f[0], _0x29339f[1]);
        delete this.Live.xbuffer[_0x2f02ca];
      }
    }
  }
};
Game.prototype.getCumulativePPS = function () {
  if (this.clock === 0) {
    return 0;
  }
  var _0xf525d = this.placedBlocks / this.clock;
  if (isNaN(_0xf525d) || !isFinite(_0xf525d)) {
    return 0;
  } else {
    return _0xf525d;
  }
};
Game.prototype.updateTextBar = function () {
  this.GameStats.get("CLOCK").set(sprintTimeFormat(this.clock, 2));
  this.GameStats.get("PPS").set(this.getPPS().toFixed(2));
  this.GameStats.get("APM").set(this.getAPM());
  this.GameStats.get("VS").set(this.getVS());
  this.GameStats.render();
};
Game.prototype.sendRepFragment = function () {
  if (this.transmitMode === 1) {
    var _0x874989 = [];
    var _0x4043a1 = null;
    var _0x3c3356 = false;
    var _0x4373b4 = null;
    for (
      ;
      this.replayPartsSent < this.Replay.actions.length;
      ++this.replayPartsSent
    ) {
      var _0x4efefd = this.Replay.actions[this.replayPartsSent];
      var _0x201a0b = {};
      for (var _0x3c823c in _0x4efefd) {
        _0x201a0b[_0x3c823c] = _0x4efefd[_0x3c823c];
      }
      if (_0x4373b4 === null) {
        _0x4043a1 = _0x4efefd;
      } else if (_0x4efefd.t - _0x4043a1.t > 10) {
        _0x3c3356 = true;
      }
      _0x201a0b.t =
        _0x4373b4 === null ? 0 : Math.max(0, _0x4efefd.t - _0x4373b4);
      _0x874989.push(_0x201a0b);
      _0x4373b4 = _0x4efefd.t;
    }
    if (_0x874989.length) {
      this.Live.sendRepFragment(_0x874989, _0x3c3356);
    }
  }
};
Game.prototype.sendReplay2Fragment = function () {
  if (
    this.transmitMode === 2 &&
    this.Replay2 &&
    (this.Replay2.finalizeCurrentFrame(),
    !(this.replay2PartsSent >= this.Replay2.frames.length))
  ) {
    var _0x489adc = false;
    for (
      var _0x5ccbc4 = this.replay2PartsSent;
      _0x5ccbc4 < this.Replay2.frames.length;
      _0x5ccbc4++
    ) {
      if (
        this.Replay2.frames[_0x5ccbc4].type ===
        Replay2Common.FRAME_TYPE.FULL
      ) {
        _0x489adc = true;
        break;
      }
    }
    var _0x14a1b9 = this.Replay2.encodeFrameRange(
      this.replay2PartsSent,
      this.Replay2.frames.length,
    );
    this.Live.sendReplay2Fragment(_0x14a1b9, _0x489adc);
    this.replay2PartsSent = this.Replay2.frames.length;
  }
};
Game.prototype.sendSnapshot = function () {
  var _0x33e6b0;
  var _0x9d9ca0;
  var _0x5ced72 = copyMatrix(this.matrix);
  var _0x311675 = this.activeBlock.pos.x;
  var _0x4531a0 = this.activeBlock.pos.y;
  var _0x364825 =
    this.blockSets[this.activeBlock.set].blocks[this.activeBlock.id];
  var _0x4f0f31 = _0x364825.blocks[this.activeBlock.rot].length;
  for (var _0x4e576c = 0; _0x4e576c < _0x4f0f31; _0x4e576c++) {
    for (var _0x3e16d4 = 0; _0x3e16d4 < _0x4f0f31; _0x3e16d4++) {
      if (
        _0x364825.blocks[this.activeBlock.rot][_0x4e576c][_0x3e16d4] >
        0
      ) {
        _0x9d9ca0 = _0x4531a0 + _0x4e576c;
        if (
          (_0x33e6b0 = _0x311675 + _0x3e16d4) >= 0 &&
          _0x9d9ca0 >= 0 &&
          _0x9d9ca0 < _0x5ced72.length &&
          _0x33e6b0 < _0x5ced72[0].length
        ) {
          _0x5ced72[_0x9d9ca0][_0x33e6b0] = _0x364825.color;
        }
      }
    }
  }
  this.Live.sendSnapshot(_0x5ced72);
};
Game.prototype.garbageQueue = function (_0x161c3e) {
  if (this.R.gblock !== 3) {
    this.addIntoGarbageQueue(_0x161c3e);
  } else {
    this.addAsyncGarbage(_0x161c3e);
  }
};
Game.prototype.addIntoGarbageQueue = function (_0xc31d0b) {
  var _0x18a036 = this.timestamp();
  if (this.R.mess === 0) {
    this.incomingGarbage.push([_0xc31d0b, _0x18a036]);
  } else {
    var _0x1ae5ab = 0;
    var _0x15730d = 0;
    var _0x2adaae = this.R.mess > 0 ? this.R.mess : 100;
    for (; _0x1ae5ab < _0xc31d0b; ) {
      _0x15730d++;
      if (_0x2adaae === 100 || Math.random() < _0x2adaae / 100) {
        this.incomingGarbage.push([_0x15730d, _0x18a036]);
        _0x15730d = 0;
      }
      _0x1ae5ab++;
    }
    if (_0x15730d) {
      this.incomingGarbage.push([_0x15730d, _0x18a036]);
    }
  }
  this.redBar += _0xc31d0b;
  this.recordRedbarChange(_0x18a036);
  this.v.redrawRedBar(true);
};
Game.prototype.addAsyncGarbage = function (_0x1c994a) {
  var _0x1133bb = this.addGarbage(_0x1c994a);
  for (
    ;
    this.checkIntersection(
      this.activeBlock.pos.x,
      this.activeBlock.pos.y,
      null,
    );
  ) {
    this.activeBlock.pos.y--;
  }
  this.updateGhostPiece(true);
  if (this.isPmode(false) === 4 && this.activeBlock.pos.y === -4) {
    this.GameOver();
  }
  return _0x1133bb;
};
Game.prototype.addAsyncGarbageFromTheQueue = function () {
  for (
    this.addGarbageFromQueue(this.timestamp() + 10000);
    this.checkIntersection(
      this.activeBlock.pos.x,
      this.activeBlock.pos.y,
      null,
    );
  ) {
    this.activeBlock.pos.y--;
  }
  this.updateGhostPiece(true);
  if (this.activeBlock.pos.y <= -4) {
    this.GameOver();
  }
};
Game.prototype.cancelSolid = function () {
  if (this.solidInterval !== null) {
    clearTimeout(this.solidInterval);
  }
  this.solidInterval = null;
};
Game.prototype.solidStartRaising = function () {
  var _0x55536c = this;
  var _0x59d561 = 0;
  var _0x4e3455 = this.solidProfiles[this.Live.sgProfile];
  if (!_0x4e3455) {
    _0x4e3455 = this.R.sgProfile;
  }
  this.cancelSolid();
  function _0x24de41() {
    let _0x280a4c =
      _0x4e3455[Math.min(_0x4e3455.length - 1, _0x59d561)] * 1000;
    _0x55536c.solidInterval = setTimeout(_0x5d89b0, _0x280a4c);
  }
  function _0x5d89b0() {
    _0x55536c.solidToAdd++;
    if (++_0x59d561 === 20) {
      _0x55536c.cancelSolid();
    } else {
      _0x24de41();
    }
  }
  _0x24de41();
};
Game.prototype.toggleStats = function (_0x21a089) {
  if (this.statsEnabled) {
    this.statsEnabled = false;
    this.stats = null;
    this.fpsElement.textContent = "";
  } else {
    this.stats = new Stats();
    this.statsDASPanel = this.stats.addPanel(
      new Stats.Panel("ΔDAS", "#ff8", "#221"),
    );
    this.stats.domElement.id = "fps";
    this.fpsElement.appendChild(this.stats.domElement);
    this.statsEnabled = true;
    this.statsMode = _0x21a089;
    this.fpsElement.style.marginTop = "15px";
  }
};
Game.prototype.cheeseModeStart = function () {
  this.lastHolePos = null;
  this.cheeseLevel = this.maxCheeseHeight;
  for (var _0xd27e4f = 0; _0xd27e4f < this.cheeseLevel; _0xd27e4f++) {
    this.addGarbage(1);
  }
};
Game.prototype.setLrem = function (_0x5f225a) {
  if (_0x5f225a < 10000) {
    this.lrem.textContent = _0x5f225a;
  } else {
    this.lrem.innerHTML = "&infin;";
  }
};
Game.prototype.applyGravityLvl = function (_0x1b45ef) {
  this.R.gravityLvl = _0x1b45ef;
  this.baseGravity = this.getGravityLevel(_0x1b45ef);
  this.currentGravity = this.baseGravity.slice(0);
  if (
    !!this.softDrop &&
    !this.isSoftDropFasterThanGravity() &&
    !this.starting
  ) {
    this.softDropSet(false, this.timestamp());
  }
};
Game.prototype.setLockDelay = function (_0x2be04d) {
  this.lockDelay = _0x2be04d[0];
  this.maxLockDelayWithoutLock = _0x2be04d[1];
  this.maxWithoutLock = _0x2be04d[2];
};
Game.prototype.pageTitle = function (_0x178c1d) {
  document.title = _0x178c1d;
};
window.requestAnimFrame =
  window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.oRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  function (_0x2d1f55, _0x2ac69c) {
    window.setTimeout(_0x2d1f55, 16.666666666666668);
  };
Game.prototype.browserTabFocusChange = function (_0x42f107) {
  if (_0x42f107 === 0) {
    this.isTabFocused = false;
    this.lastSeen = this.timestamp();
    if (this.play) {
      this.play = false;
      this.Replay.toggleAfkMode(true);
      if (
        !this.pmode &&
        (this.solidInterval !== null || !!this.solidToAdd)
      ) {
        this.GameOver();
        this.Live.showInChat(
          "<span style='color:yellow'>NOTE</span>",
          "Game lost focus during the final hurry-up phase, your game was halted to avoid stalling.",
        );
        this.lastSeen = null;
      }
    }
  } else {
    this.isTabFocused = true;
    const _0x2464ea =
      this.isPmode(false) === 9 && this.ModeManager.startingTimeout;
    if (
      this.lastSeen !== null &&
      !this.play &&
      !this.gameEnded &&
      !this.starting &&
      !_0x2464ea
    ) {
      this.play = true;
      var _0x278aa7 = this.timestamp();
      var _0xaab6a0 = _0x278aa7 - this.lastSeen;
      this.timer += _0xaab6a0 / 1000;
      this.clock += _0xaab6a0 / 1000;
      if (_0xaab6a0 > 1000) {
        this.Replay.config.afk =
          this.Replay.config.afk === undefined
            ? _0xaab6a0
            : this.Replay.config.afk + _0xaab6a0;
        if (_0xaab6a0 > 65535) {
          _0xaab6a0 = 65535;
        }
        var _0x3c9603 = new ReplayAction(
          this.Replay.Action.AUX,
          this.lastSeen,
        );
        _0x3c9603.d = [this.Replay.AUX.AFK, _0xaab6a0];
        this.Replay.isAfkMode = false;
        this.Replay.add(_0x3c9603);
      }
      this.Replay.toggleAfkMode(false, _0x278aa7);
    }
    if (this.lastSeen === null && this.play && this.pmode) {
      this.startPractice(this.pmode);
    }
    this.lastSeen = null;
  }
};
Game.prototype.sprintInfoLineContent = function (_0x21eb87) {
  hideElem(document.getElementById("stLrem"));
  hideElem(document.getElementById("stTSD"));
  hideElem(document.getElementById("stPC"));
  hideElem(document.getElementById("oRem"));
  if (_0x21eb87 === 0) {
    showElem(document.getElementById("stLrem"));
  } else if (_0x21eb87 === 1) {
  } else if (_0x21eb87 === 2) {
    showElem(document.getElementById("stTSD"));
  } else if (_0x21eb87 === 3) {
    showElem(document.getElementById("stPC"));
  } else if (
    typeof _0x21eb87 == "string" ||
    _0x21eb87 instanceof String
  ) {
    let _0x339d01 = document.getElementById("oRem");
    showElem(_0x339d01);
    _0x339d01.innerHTML = _0x21eb87;
  }
};
Game.prototype.evalPCmodeEnd = function () {
  let _0x3597f4 = false;
  if (this.PCdata.blocks >= 10) {
    _0x3597f4 = true;
  }
  if (!_0x3597f4) {
    let _0x90c57a = 19 - (4 - this.PCdata.lines);
    for (var _0x1ed215 = 0; _0x1ed215 < 10; _0x1ed215++) {
      if (this.matrix[_0x90c57a][_0x1ed215] !== 0) {
        _0x3597f4 = true;
        break;
      }
    }
  }
  if (_0x3597f4) {
    this.Caption.gameWarning(i18n.notPC, i18n.notPCInfo);
    this.practiceModeCompleted();
  }
};
Game.prototype.savePlacementTime = function () {
  if (this.lastPlacements.length >= 8) {
    this.lastPlacements.shift();
  }
  this.lastPlacements.push(this.clock);
};
Game.prototype.getCurrentPPS = function () {
  var _0x1be41c;
  var _0xba199e = this.lastPlacements.length;
  _0x1be41c =
    _0xba199e > 1
      ? (_0xba199e - 1) / (this.clock - this.lastPlacements[0])
      : _0xba199e / this.clock;
  if (isNaN(_0x1be41c) || !isFinite(_0x1be41c)) {
    return 0;
  } else {
    return _0x1be41c;
  }
};
Game.prototype.isHardDropAllowed = function () {
  return (
    this.R.speedLimit === 0 ||
    this.lastPlacements.length < 5 ||
    this.getCurrentPPS() <= this.R.speedLimit ||
    (this.Caption.speedWarning(this.R.speedLimit), false)
  );
};
Game.prototype.setSpeedLimit = function (_0x1d772f) {
  if (_0x1d772f < 0.1) {
    this.R.speedLimit = 0;
    this.getPPS = this.getCumulativePPS;
  } else {
    this.R.speedLimit = _0x1d772f;
    this.getPPS = this.getCurrentPPS;
  }
};
Game.prototype.setupGameLinks = function () {
  let _0x2c6962 = this.Live;
  let _0x14f832 = this;
  let _0xc4b43a = function (_0x246684, _0x1a3841, _0x208600) {
    _0x2c6962.storedPlayParam = {
      gameMode: _0x246684,
      mode: _0x1a3841,
      rule: _0x208600,
    };
    _0x2c6962.urlPlayParamApplied = true;
    if (_0x2c6962.roomName == "The Private Room") {
      _0x2c6962.tryPlayParam();
    } else {
      _0x2c6962.createPrivatePracticeRoom(true);
    }
  };
  $(".plLinks a").on("click", function (_0x4681bc) {
    let _0x42ca07 = $(this).attr("id");
    if (
      _0x42ca07 &&
      _0x42ca07.startsWith("pl") &&
      _0x2c6962.connected &&
      !_0x14f832.starting &&
      _0x2c6962.authReady
    ) {
      switch (_0x42ca07.substr(2)) {
        case "2":
          _0xc4b43a(1, 2);
          break;
        case "3":
        case "H":
          _0xc4b43a(1, 1);
          break;
        case "4":
          _0xc4b43a(1, 3);
          break;
        case "5":
          _0xc4b43a(1, 4);
          break;
        case "6":
          _0xc4b43a(3, 1);
          break;
        case "7":
        case "I":
          _0xc4b43a(3, 2);
          break;
        case "8":
          _0xc4b43a(3, 3);
          break;
        case "9":
          _0xc4b43a(4);
          break;
        case "A":
          _0xc4b43a(5);
          break;
        case "B":
          _0xc4b43a(7);
          break;
        case "C":
          _0xc4b43a(8);
          break;
        case "D":
          _0xc4b43a(2);
          break;
        case "E":
          _0xc4b43a(1, 3, 1);
          break;
        case "F":
          _0xc4b43a(1, null, 2);
          break;
        case "G":
          _0xc4b43a(1, null, 3);
      }
      _0x4681bc.preventDefault();
    }
  });
};
LineClearAnimator.prototype.render = function (_0x25b550) {
  this.t += _0x25b550;
  var _0x20b513 = Math.max(0, 1 - this.t / this.clearDelay);
  this.g.v.clearMainCanvas();
  for (var _0x43dbca = 0; _0x43dbca < 20; _0x43dbca++) {
    if (this.clearPositions.indexOf(_0x43dbca) !== -1) {
      if (this.IS_SOLID) {
        this.g.v.drawClearLine(_0x43dbca, _0x20b513);
      } else {
        this.g.v.setAlpha(_0x20b513);
        for (var _0x14b8e6 = 0; _0x14b8e6 < 10; _0x14b8e6++) {
          this.g.v.drawBlock(
            _0x14b8e6,
            _0x43dbca,
            this.matrix[_0x43dbca][_0x14b8e6],
            0,
          );
        }
        this.g.v.setAlpha(1);
      }
    } else {
      for (_0x14b8e6 = 0; _0x14b8e6 < 10; _0x14b8e6++) {
        this.g.v.drawBlock(
          _0x14b8e6,
          _0x43dbca,
          this.matrix[_0x43dbca][_0x14b8e6],
          0,
        );
      }
    }
  }
  this.g.v.redrawRedBar(false);
  if (this.t > this.clearDelay) {
    this.finished();
  }
};
LineClearAnimator.prototype.finished = function () {
  this.g.animator = null;
  if (!this.g.gameEnded) {
    this.g.play = true;
  }
  this.g.redrawBlocked = false;
  this.g.redraw();
  this.g.updateQueueBox();
  this.g.redrawHoldBox();
};
Ctx2DView.prototype.isAvailable = function () {
  return true;
};
Ctx2DView.prototype.initRenderer = function () {
  this.ctx = this.g.canvas.getContext("2d");
  this.hctx = this.g.holdCanvas.getContext("2d");
  this.qctx = this.g.queueCanvas.getContext("2d");
};
Ctx2DView.prototype.redrawMatrix = function () {
  this.clearMainCanvas();
  if (!this.g.isInvisibleSkin) {
    for (var _0x87287c = 0; _0x87287c < 20; _0x87287c++) {
      for (var _0x2770c4 = 0; _0x2770c4 < 10; _0x2770c4++) {
        this.drawBlock(
          _0x2770c4,
          _0x87287c,
          this.g.matrix[_0x87287c][_0x2770c4] & 15,
        );
        if (this.g.matrix[_0x87287c][_0x2770c4] & 16) {
          this.drawBrickOverlay(_0x2770c4, _0x87287c, false);
        }
      }
    }
  }
};
Ctx2DView.prototype.clearMainCanvas = function () {
  this.ctx.clearRect(0, 0, this.g.canvas.width, this.g.canvas.height);
};
Ctx2DView.prototype.clearHoldCanvas = function () {
  this.hctx.clearRect(
    0,
    0,
    this.g.holdCanvas.width,
    this.g.holdCanvas.height,
  );
};
Ctx2DView.prototype.clearQueueCanvas = function () {
  this.qctx.clearRect(
    0,
    0,
    this.g.queueCanvas.width,
    this.g.queueCanvas.height,
  );
};
Ctx2DView.prototype.drawBlockOnCanvas = function (
  _0x5d8003,
  _0x1718fe,
  _0x380d08,
  _0x4d717a,
) {
  const _0x5bd2fa = _0x4d717a === this.HOLD ? this.hctx : this.qctx;
  if (this.g.skinId === 0) {
    const _0x575f0a =
      this.g.monochromeSkin && _0x380d08 <= 7
        ? this.g.monochromeSkin
        : this.g.colors[_0x380d08];
    this.drawRectangle(
      _0x5bd2fa,
      _0x5d8003 * this.g.block_size,
      _0x1718fe * this.g.block_size,
      this.g.block_size,
      this.g.block_size,
      _0x575f0a,
    );
  } else {
    const _0x4aa1db = this.g.skins[this.g.skinId].w;
    _0x5bd2fa.drawImage(
      this.g.tex,
      this.g.coffset[_0x380d08] * _0x4aa1db,
      0,
      _0x4aa1db,
      _0x4aa1db,
      _0x5d8003 * this.g.block_size,
      _0x1718fe * this.g.block_size,
      this.g.block_size,
      this.g.block_size,
    );
  }
};
Ctx2DView.prototype.drawBrickOverlayOnCanvas = function (
  _0x2b5a3c,
  _0x2d4915,
  _0x587de8,
) {
  (_0x587de8 === this.HOLD ? this.hctx : this.qctx).drawImage(
    this.g.tex2,
    0,
    0,
    32,
    32,
    _0x2b5a3c * this.g.block_size,
    _0x2d4915 * this.g.block_size,
    this.g.block_size,
    this.g.block_size,
  );
};
Ctx2DView.prototype.drawBrickOverlay = function (
  _0x13b328,
  _0x589530,
  _0x2e4906,
) {
  if (
    _0x13b328 >= 0 &&
    _0x589530 >= 0 &&
    _0x13b328 < 10 &&
    _0x589530 < 20
  ) {
    if (_0x2e4906) {
      this.ctx.globalAlpha = 0.5;
    }
    var _0x50f883 = this.g.drawScale * this.g.block_size;
    this.ctx.drawImage(
      this.g.tex2,
      0,
      0,
      32,
      32,
      _0x13b328 * this.g.block_size,
      _0x589530 * this.g.block_size,
      _0x50f883,
      _0x50f883,
    );
    if (_0x2e4906) {
      this.ctx.globalAlpha = 1;
    }
  }
};
Ctx2DView.prototype.drawBlock = function (
  _0x4cfed7,
  _0x2f2621,
  _0x13107e,
) {
  if (
    _0x13107e &&
    _0x4cfed7 >= 0 &&
    _0x2f2621 >= 0 &&
    _0x4cfed7 < 10 &&
    _0x2f2621 < 20
  ) {
    const _0x300693 = this.g.drawScale * this.g.block_size;
    const _0x2d2506 = _0x4cfed7 * this.g.block_size;
    const _0x382211 = _0x2f2621 * this.g.block_size;
    if (this.g.skinId) {
      const _0x250981 = this.g.skins[this.g.skinId].w;
      this.ctx.drawImage(
        this.g.tex,
        this.g.coffset[_0x13107e] * _0x250981,
        0,
        _0x250981,
        _0x250981,
        _0x2d2506,
        _0x382211,
        _0x300693,
        _0x300693,
      );
    } else {
      const _0x11642e =
        this.g.monochromeSkin && _0x13107e <= 7
          ? this.g.monochromeSkin
          : this.g.colors[_0x13107e];
      this.drawRectangle(
        this.ctx,
        _0x2d2506,
        _0x382211,
        _0x300693,
        _0x300693,
        _0x11642e,
      );
    }
  }
};
Ctx2DView.prototype.drawGhostBlock = function (
  _0x20d4a1,
  _0x48cda1,
  _0x460479,
) {
  if (
    _0x20d4a1 >= 0 &&
    _0x48cda1 >= 0 &&
    _0x20d4a1 < 10 &&
    _0x48cda1 < 20
  ) {
    var _0x441643 = this.g.drawScale * this.g.block_size;
    if (this.g.ghostSkinId === 0) {
      this.ctx.globalAlpha = 0.5;
      if (this.g.skinId > 0) {
        this.ctx.drawImage(
          this.g.tex,
          this.g.coffset[_0x460479] * this.g.skins[this.g.skinId].w,
          0,
          this.g.skins[this.g.skinId].w,
          this.g.skins[this.g.skinId].w,
          _0x20d4a1 * this.g.block_size,
          _0x48cda1 * this.g.block_size,
          _0x441643,
          _0x441643,
        );
      } else {
        this.drawBlock(_0x20d4a1, _0x48cda1, _0x460479);
      }
      this.ctx.globalAlpha = 1;
    } else {
      var _0x5b9cdb = this.g.ghostSkins[this.g.ghostSkinId];
      this.ctx.drawImage(
        this.g.ghostTex,
        (this.g.coffset[_0x460479] - 2) * _0x5b9cdb.w,
        0,
        _0x5b9cdb.w,
        _0x5b9cdb.w,
        _0x20d4a1 * this.g.block_size,
        _0x48cda1 * this.g.block_size,
        _0x441643,
        _0x441643,
      );
    }
  }
};
Ctx2DView.prototype.drawOutline = function (_0x278214) {
  var _0x4eb28e = this.g.block_size;
  this.ctx.beginPath();
  for (
    var _0x3b4d0a = 0;
    _0x3b4d0a < _0x278214.length;
    _0x3b4d0a += 4
  ) {
    this.ctx.moveTo(
      _0x278214[_0x3b4d0a] * _0x4eb28e,
      _0x278214[_0x3b4d0a + 1] * _0x4eb28e,
    );
    this.ctx.lineTo(
      _0x278214[_0x3b4d0a + 2] * _0x4eb28e,
      _0x278214[_0x3b4d0a + 3] * _0x4eb28e,
    );
  }
  this.ctx.strokeStyle = "rgba(255,255,255,0.55)";
  this.ctx.lineWidth = 2;
  this.ctx.stroke();
};
Ctx2DView.prototype.drawRectangle = function (
  _0x12fb15,
  _0x16c95b,
  _0xe14d7a,
  _0x23278c,
  _0x572b90,
  _0x1abe73,
) {
  _0x12fb15.beginPath();
  _0x12fb15.rect(_0x16c95b, _0xe14d7a, _0x23278c, _0x572b90);
  _0x12fb15.fillStyle = _0x1abe73;
  _0x12fb15.fill();
};
Ctx2DView.prototype.drawLine = function (
  _0x359796,
  _0x1653e2,
  _0x5df843,
  _0x2074c0,
  _0x38d680,
) {
  _0x359796.beginPath();
  _0x359796.moveTo(_0x1653e2, _0x5df843);
  _0x359796.lineTo(_0x2074c0, _0x38d680);
  _0x359796.strokeStyle = "grey";
  _0x359796.lineWidth = 1;
  _0x359796.stroke();
};
Ctx2DView.prototype.redrawRedBar = function (_0x36aa7c) {
  if (_0x36aa7c || this.g.redBar) {
    if (_0x36aa7c) {
      this.ctx.clearRect(
        240,
        0,
        8,
        (20 - this.g.redBar) * this.g.block_size,
      );
    }
    this.drawRectangle(
      this.ctx,
      240,
      (20 - this.g.redBar) * this.g.block_size,
      8,
      this.g.redBar * this.g.block_size,
      "#FF270F",
    );
  }
};
Ctx2DView.prototype.drawClearLine = function (_0x4e3146, _0x271c6d) {
  this.ctx.globalAlpha = _0x271c6d;
  this.drawRectangle(
    this.ctx,
    0,
    _0x4e3146 * this.g.block_size,
    this.g.block_size * 10,
    this.g.block_size,
    "#FFFFFF",
  );
  this.ctx.globalAlpha = 1;
};
Ctx2DView.prototype.setAlpha = function (_0x9a817c) {
  this.ctx.globalAlpha = _0x9a817c;
};
Ctx2DView.prototype.clearRect = function (
  _0x4d6659,
  _0x454fe9,
  _0xc8ca8,
  _0x2006bf,
) {
  this.ctx.clearRect(_0x4d6659, _0x454fe9, _0xc8ca8, _0x2006bf);
};
Ctx2DView.prototype.createFastFont = function () {
  return new FastFont2D();
};
FastFont2D.prototype.init = function (_0x227689) {
  _0x227689();
};
FastFont2D.prototype.resizeCanvas = function () {
  if (this.canvas.height < this.canvas.clientHeight) {
    this.canvas.height = this.canvas.clientHeight;
  }
};
FastFont2D.prototype.renderLines = function (_0x1e09ed) {
  this.resizeCanvas();
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  var _0x5185e5 = this.canvas.height;
  if (_0x1e09ed.length > this.availableLines) {
    this.availableLines = _0x1e09ed.length;
  }
  var _0x3f8011 = _0x5185e5 / this.availableLines;
  for (var _0xb6cb02 = 0; _0xb6cb02 < _0x1e09ed.length; ++_0xb6cb02) {
    this.draw(
      _0x1e09ed[_0xb6cb02].value.toString(),
      0,
      _0x3f8011 * _0xb6cb02 + this.fontSize,
    );
  }
};
FastFont2D.prototype.draw = function (
  _0x2ceb1f,
  _0x5be72d,
  _0x514d37,
) {
  this.ctx.font = "bold " + this.fontSize + "px Verdana,serif";
  this.ctx.fillStyle = "#808080";
  this.ctx.fillText(_0x2ceb1f, _0x5be72d, _0x514d37);
};
WebGLUtils.getWebGLcontext = function (_0x436393) {
  var _0x5708d2 = {
    preserveDrawingBuffer: false,
    antialias: false,
    powerPreference: "high-performance",
    alpha: true,
    premultipliedalpha: false,
  };
  var _0x1b4f4f =
    _0x436393.getContext("webgl", _0x5708d2) ||
    _0x436393.getContext("experimental-webgl", _0x5708d2);
  if (!_0x1b4f4f) {
    alert("Your browser does not support WebGL!");
  }
  _0x1b4f4f.clearColor(0, 0, 0, 0);
  _0x1b4f4f.clear(
    _0x1b4f4f.COLOR_BUFFER_BIT | _0x1b4f4f.DEPTH_BUFFER_BIT,
  );
  return _0x1b4f4f;
};
WebGLUtils.createProgram = function (_0x2a1352, _0x239045) {
  var _0x460252 = _0x2a1352.createProgram();
  var _0x384e60 = _0x2a1352.createShader(_0x2a1352.VERTEX_SHADER);
  var _0x6b1188 = _0x2a1352.createShader(_0x2a1352.FRAGMENT_SHADER);
  _0x2a1352.shaderSource(_0x384e60, _0x239045.vertex);
  _0x2a1352.shaderSource(_0x6b1188, _0x239045.fragment);
  _0x2a1352.compileShader(_0x384e60);
  if (
    _0x2a1352.getShaderParameter(_0x384e60, _0x2a1352.COMPILE_STATUS)
  ) {
    _0x2a1352.compileShader(_0x6b1188);
    if (
      _0x2a1352.getShaderParameter(
        _0x6b1188,
        _0x2a1352.COMPILE_STATUS,
      )
    ) {
      _0x2a1352.attachShader(_0x460252, _0x384e60);
      _0x2a1352.attachShader(_0x460252, _0x6b1188);
      _0x2a1352.linkProgram(_0x460252);
      if (
        _0x2a1352.getProgramParameter(
          _0x460252,
          _0x2a1352.LINK_STATUS,
        )
      ) {
        _0x2a1352.validateProgram(_0x460252);
        if (
          _0x2a1352.getProgramParameter(
            _0x460252,
            _0x2a1352.VALIDATE_STATUS,
          )
        ) {
          return _0x460252;
        }
        console.error(
          "Validation error",
          _0x2a1352.getProgramInfoLog(_0x460252),
        );
      } else {
        console.error(
          "Linking error",
          _0x2a1352.getProgramInfoLog(_0x460252),
        );
      }
    } else {
      console.error(
        "Fragment shader: compile err",
        _0x2a1352.getShaderInfoLog(_0x6b1188),
      );
    }
  } else {
    console.error(
      "Vertex shader: compile err",
      _0x2a1352.getShaderInfoLog(_0x384e60),
    );
  }
};
WebGLUtils.registerContextAttrUnifs = function (
  _0x2b8eda,
  _0xa9143a,
) {
  var _0x102b88 = _0xa9143a.program;
  var _0x38a528 = _0x2b8eda.getProgramParameter(
    _0x102b88,
    _0x2b8eda.ACTIVE_ATTRIBUTES,
  );
  for (var _0x31737c = 0; _0x31737c < _0x38a528; _0x31737c++) {
    var _0x280542 = _0x2b8eda.getActiveAttrib(_0x102b88, _0x31737c);
    _0xa9143a[_0x280542.name] = _0x2b8eda.getAttribLocation(
      _0x102b88,
      _0x280542.name,
    );
  }
  var _0x12eb95 = _0x2b8eda.getProgramParameter(
    _0x102b88,
    _0x2b8eda.ACTIVE_UNIFORMS,
  );
  for (_0x31737c = 0; _0x31737c < _0x12eb95; _0x31737c++) {
    var _0x29c2a9 = _0x2b8eda.getActiveUniform(_0x102b88, _0x31737c);
    _0xa9143a[_0x29c2a9.name] = _0x2b8eda.getUniformLocation(
      _0x102b88,
      _0x29c2a9.name,
    );
  }
};
WebGLView.prototype.isAvailable = function () {
  var _0x23846d = this.g.canvas;
  return (
    !!_0x23846d.getContext("webgl") ||
    !!_0x23846d.getContext("experimental-webgl")
  );
};
WebGLView.prototype.initGLContext = function (_0x2f3675) {
  _0x2f3675.gl = WebGLUtils.getWebGLcontext(_0x2f3675.elem);
  _0x2f3675.program = WebGLUtils.createProgram(
    _0x2f3675.gl,
    this.shaders,
  );
  _0x2f3675.m4 = new Float32Array(16);
  var _0x108e89 = _0x2f3675.gl;
  var _0x3e0ae8 = _0x2f3675.program;
  _0x108e89.useProgram(_0x3e0ae8);
  _0x2f3675.positionLocation = _0x108e89.getAttribLocation(
    _0x3e0ae8,
    "a_position",
  );
  _0x2f3675.texcoordLocation = _0x108e89.getAttribLocation(
    _0x3e0ae8,
    "a_texcoord",
  );
  _0x2f3675.matrixLocation = _0x108e89.getUniformLocation(
    _0x3e0ae8,
    "u_matrix",
  );
  _0x2f3675.textureMatrixLocation = _0x108e89.getUniformLocation(
    _0x3e0ae8,
    "u_textureMatrix",
  );
  _0x2f3675.globalAlpha = _0x108e89.getUniformLocation(
    _0x3e0ae8,
    "globalAlpha",
  );
  _0x108e89.uniform1f(_0x2f3675.globalAlpha, 1);
  _0x2f3675.positionBuffer = _0x108e89.createBuffer();
  _0x108e89.bindBuffer(
    _0x108e89.ARRAY_BUFFER,
    _0x2f3675.positionBuffer,
  );
  _0x108e89.bufferData(
    _0x108e89.ARRAY_BUFFER,
    new Float32Array([0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1]),
    _0x108e89.STATIC_DRAW,
  );
  _0x2f3675.texcoordBuffer = _0x108e89.createBuffer();
  _0x108e89.bindBuffer(
    _0x108e89.ARRAY_BUFFER,
    _0x2f3675.texcoordBuffer,
  );
  _0x108e89.bufferData(
    _0x108e89.ARRAY_BUFFER,
    new Float32Array([0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1]),
    _0x108e89.STATIC_DRAW,
  );
  _0x2f3675.textureInfos = [];
  _0x2f3675.boundBuffers = false;
  _0x2f3675.boundTexture = null;
  this.initEmptyTexture(_0x2f3675, 0);
  this.initEmptyTexture(_0x2f3675, 1);
  this.initRedbarTexture(_0x2f3675, 2);
  this.initWhiteTexture(_0x2f3675, 3);
};
WebGLView.prototype.initRenderer = function () {
  this.ctxs = [
    {
      elem: this.g.canvas,
      mesh: {
        w: 10,
        h: 20,
      },
    },
    {
      elem: this.g.holdCanvas,
      mesh: {
        w: 4,
        h: 4,
      },
    },
    {
      elem: this.g.queueCanvas,
      mesh: {
        w: 4,
        h: 15,
      },
    },
  ];
  this.initGLContext(this.ctxs[0]);
  this.initGLContext(this.ctxs[1]);
  this.initGLContext(this.ctxs[2]);
  if (this.g.skinId !== undefined && this.g.skinId) {
    this.g.changeSkin(this.g.skinId);
  }
};
WebGLView.prototype.initRedbarTexture = function (
  _0x458ed6,
  _0x34d54e,
) {
  var _0x466569 = _0x458ed6.gl;
  var _0x30efe1 = _0x466569.createTexture();
  _0x30efe1.id = _0x34d54e;
  _0x466569.bindTexture(_0x466569.TEXTURE_2D, _0x30efe1);
  _0x466569.texImage2D(
    _0x466569.TEXTURE_2D,
    0,
    _0x466569.RGBA,
    2,
    1,
    0,
    _0x466569.RGBA,
    _0x466569.UNSIGNED_BYTE,
    new Uint8Array([255, 39, 15, 255, 255, 255, 255, 255]),
  );
  _0x466569.texParameteri(
    _0x466569.TEXTURE_2D,
    _0x466569.TEXTURE_MAG_FILTER,
    _0x466569.NEAREST,
  );
  _0x466569.texParameteri(
    _0x466569.TEXTURE_2D,
    _0x466569.TEXTURE_WRAP_S,
    _0x466569.CLAMP_TO_EDGE,
  );
  _0x466569.texParameteri(
    _0x466569.TEXTURE_2D,
    _0x466569.TEXTURE_WRAP_T,
    _0x466569.CLAMP_TO_EDGE,
  );
  _0x466569.texParameteri(
    _0x466569.TEXTURE_2D,
    _0x466569.TEXTURE_MIN_FILTER,
    _0x466569.LINEAR,
  );
  var _0x49bd03 = {
    width: 2,
    height: 1,
    texture: _0x30efe1,
  };
  _0x458ed6.textureInfos[_0x34d54e] = _0x49bd03;
};
WebGLView.prototype.initWhiteTexture = function (
  _0x3506f0,
  _0xadaa2c,
) {
  var _0x12dceb = _0x3506f0.gl;
  var _0x457e1b = _0x12dceb.createTexture();
  _0x457e1b.id = _0xadaa2c;
  _0x12dceb.bindTexture(_0x12dceb.TEXTURE_2D, _0x457e1b);
  _0x12dceb.texImage2D(
    _0x12dceb.TEXTURE_2D,
    0,
    _0x12dceb.RGBA,
    1,
    1,
    0,
    _0x12dceb.RGBA,
    _0x12dceb.UNSIGNED_BYTE,
    new Uint8Array([255, 255, 255, 255]),
  );
  _0x12dceb.texParameteri(
    _0x12dceb.TEXTURE_2D,
    _0x12dceb.TEXTURE_MAG_FILTER,
    _0x12dceb.NEAREST,
  );
  _0x12dceb.texParameteri(
    _0x12dceb.TEXTURE_2D,
    _0x12dceb.TEXTURE_WRAP_S,
    _0x12dceb.CLAMP_TO_EDGE,
  );
  _0x12dceb.texParameteri(
    _0x12dceb.TEXTURE_2D,
    _0x12dceb.TEXTURE_WRAP_T,
    _0x12dceb.CLAMP_TO_EDGE,
  );
  _0x12dceb.texParameteri(
    _0x12dceb.TEXTURE_2D,
    _0x12dceb.TEXTURE_MIN_FILTER,
    _0x12dceb.LINEAR,
  );
  _0x3506f0.textureInfos[_0xadaa2c] = {
    width: 1,
    height: 1,
    texture: _0x457e1b,
  };
};
WebGLView.prototype.drawOutline = function (_0x1b2893) {
  var _0x5aaf6f = this.g.block_size;
  var _0xc5e685 = this.ctxs[0];
  var _0x51f1f5 = _0xc5e685.textureInfos[3];
  _0xc5e685.gl.uniform1f(_0xc5e685.globalAlpha, 0.55);
  for (
    var _0x3a7f96 = 0;
    _0x3a7f96 < _0x1b2893.length;
    _0x3a7f96 += 4
  ) {
    var _0x4c2aed = _0x1b2893[_0x3a7f96] * _0x5aaf6f;
    var _0x2e533b = _0x1b2893[_0x3a7f96 + 1] * _0x5aaf6f;
    var _0x22812a = _0x1b2893[_0x3a7f96 + 2] * _0x5aaf6f;
    var _0x2bb858 = _0x1b2893[_0x3a7f96 + 3] * _0x5aaf6f;
    if (_0x2e533b === _0x2bb858) {
      this.drawImage(
        _0xc5e685,
        _0x51f1f5.texture,
        1,
        1,
        0,
        0,
        1,
        1,
        _0x4c2aed,
        _0x2e533b - 1,
        _0x22812a - _0x4c2aed,
        2,
      );
    } else {
      this.drawImage(
        _0xc5e685,
        _0x51f1f5.texture,
        1,
        1,
        0,
        0,
        1,
        1,
        _0x4c2aed - 1,
        _0x2e533b,
        2,
        _0x2bb858 - _0x2e533b,
      );
    }
  }
  _0xc5e685.gl.uniform1f(_0xc5e685.globalAlpha, 1);
};
WebGLView.prototype.initEmptyTexture = function (
  _0x4b68f5,
  _0x36cfac,
) {
  var _0x4c137e = _0x4b68f5.gl;
  var _0x4d8508 = _0x4c137e.createTexture();
  _0x4d8508.id = _0x36cfac;
  _0x4c137e.bindTexture(_0x4c137e.TEXTURE_2D, _0x4d8508);
  var _0x4b79ad = this.colorsInTexture.length;
  var _0x3ca98a = new Uint8Array(_0x4b79ad * 4);
  for (var _0x1e5941 = 0; _0x1e5941 < _0x4b79ad; ++_0x1e5941) {
    var _0x23c5cd = this.g.colorsV3[this.colorsInTexture[_0x1e5941]];
    if (this.g.monochromeSkin && _0x1e5941 > 1) {
      _0x23c5cd = hexToRgb(this.g.monochromeSkin, 255);
    }
    _0x3ca98a[_0x1e5941 * 4] = Math.round(_0x23c5cd[0] * 255);
    _0x3ca98a[_0x1e5941 * 4 + 1] = Math.round(_0x23c5cd[1] * 255);
    _0x3ca98a[_0x1e5941 * 4 + 2] = Math.round(_0x23c5cd[2] * 255);
    _0x3ca98a[_0x1e5941 * 4 + 3] = 255;
  }
  _0x4c137e.texImage2D(
    _0x4c137e.TEXTURE_2D,
    0,
    _0x4c137e.RGBA,
    _0x4b79ad,
    1,
    0,
    _0x4c137e.RGBA,
    _0x4c137e.UNSIGNED_BYTE,
    _0x3ca98a,
  );
  _0x4c137e.texParameteri(
    _0x4c137e.TEXTURE_2D,
    _0x4c137e.TEXTURE_WRAP_S,
    _0x4c137e.CLAMP_TO_EDGE,
  );
  _0x4c137e.texParameteri(
    _0x4c137e.TEXTURE_2D,
    _0x4c137e.TEXTURE_WRAP_T,
    _0x4c137e.CLAMP_TO_EDGE,
  );
  _0x4c137e.texParameteri(
    _0x4c137e.TEXTURE_2D,
    _0x4c137e.TEXTURE_MIN_FILTER,
    _0x4c137e.LINEAR,
  );
  _0x4c137e.texParameteri(
    _0x4c137e.TEXTURE_2D,
    _0x4c137e.TEXTURE_MAG_FILTER,
    _0x4c137e.NEAREST,
  );
  var _0x57922e = {
    width: _0x4b79ad,
    height: 1,
    texture: _0x4d8508,
  };
  _0x4b68f5.textureInfos[_0x36cfac] = _0x57922e;
};
WebGLView.prototype.loadTexture = function (_0x62a40c, _0x58902d) {
  for (var _0x30eb9b = 0; _0x30eb9b < this.ctxs.length; ++_0x30eb9b) {
    this.initEmptyTexture(this.ctxs[_0x30eb9b], _0x62a40c);
  }
  if (_0x58902d !== null) {
    var _0xc541df = new Image();
    var _0x4140b4 = this;
    _0xc541df.addEventListener("load", function () {
      for (
        var _0x540691 = 0;
        _0x540691 < _0x4140b4.ctxs.length;
        ++_0x540691
      ) {
        var _0x579bd8 = _0x4140b4.ctxs[_0x540691].gl;
        var _0x47c6f9 =
          _0x4140b4.ctxs[_0x540691].textureInfos[_0x62a40c];
        _0x47c6f9.width = _0xc541df.width;
        _0x47c6f9.height = _0xc541df.height;
        _0x4140b4.ctxs[_0x540691].boundTexture = _0x47c6f9.texture;
        _0x579bd8.bindTexture(
          _0x579bd8.TEXTURE_2D,
          _0x47c6f9.texture,
        );
        _0x579bd8.texImage2D(
          _0x579bd8.TEXTURE_2D,
          0,
          _0x579bd8.RGBA,
          _0x579bd8.RGBA,
          _0x579bd8.UNSIGNED_BYTE,
          _0xc541df,
        );
        _0x579bd8.texParameteri(
          _0x579bd8.TEXTURE_2D,
          _0x579bd8.TEXTURE_MAG_FILTER,
          _0x579bd8.LINEAR,
        );
      }
      _0x4140b4.g.redrawAll();
    });
    _0xc541df.crossOrigin = "anonymous";
    _0xc541df.src = _0x58902d;
    if (_0x62a40c === 0) {
      this.videoSkin = false;
    }
  }
};
WebGLView.prototype.drawImage = function (
  _0x591d38,
  _0xc608ba,
  _0x9f9482,
  _0x3b97bf,
  _0x433474,
  _0xe0e8e1,
  _0xfd0f1b,
  _0x23b0d2,
  _0x490149,
  _0x5134e3,
  _0x189c89,
  _0x76bc2,
) {
  var _0x2a07cc = _0x591d38.gl;
  if (_0x591d38.boundTexture !== _0xc608ba) {
    _0x2a07cc.bindTexture(_0x2a07cc.TEXTURE_2D, _0xc608ba);
    _0x591d38.boundTexture = _0xc608ba;
  }
  if (!_0x591d38.boundBuffers) {
    _0x2a07cc.bindBuffer(
      _0x2a07cc.ARRAY_BUFFER,
      _0x591d38.positionBuffer,
    );
    _0x2a07cc.enableVertexAttribArray(_0x591d38.positionLocation);
    _0x2a07cc.vertexAttribPointer(
      _0x591d38.positionLocation,
      2,
      _0x2a07cc.FLOAT,
      false,
      0,
      0,
    );
    _0x2a07cc.bindBuffer(
      _0x2a07cc.ARRAY_BUFFER,
      _0x591d38.texcoordBuffer,
    );
    _0x2a07cc.enableVertexAttribArray(_0x591d38.texcoordLocation);
    _0x2a07cc.vertexAttribPointer(
      _0x591d38.texcoordLocation,
      2,
      _0x2a07cc.FLOAT,
      false,
      0,
      0,
    );
    _0x591d38.boundBuffers = true;
  }
  Matrix.orthographic(
    0,
    _0x591d38.elem.width,
    _0x591d38.elem.height,
    0,
    -1,
    1,
    _0x591d38.m4,
  );
  Matrix.translate(
    _0x591d38.m4,
    _0x490149,
    _0x5134e3,
    0,
    _0x591d38.m4,
  );
  Matrix.scale(_0x591d38.m4, _0x189c89, _0x76bc2, 1, _0x591d38.m4);
  _0x2a07cc.uniformMatrix4fv(
    _0x591d38.matrixLocation,
    false,
    _0x591d38.m4,
  );
  Matrix.translation(
    _0x433474 / _0x9f9482,
    _0xe0e8e1 / _0x3b97bf,
    0,
    _0x591d38.m4,
  );
  Matrix.scale(
    _0x591d38.m4,
    _0xfd0f1b / _0x9f9482,
    _0x23b0d2 / _0x3b97bf,
    1,
    _0x591d38.m4,
  );
  _0x2a07cc.uniformMatrix4fv(
    _0x591d38.textureMatrixLocation,
    false,
    _0x591d38.m4,
  );
  _0x2a07cc.uniform1i(_0x591d38.textureLocation, 0);
  _0x2a07cc.drawArrays(_0x2a07cc.TRIANGLES, 0, 6);
};
WebGLView.prototype.redrawMatrix = function () {
  this.clearMainCanvas();
  if (!this.g.isInvisibleSkin) {
    for (var _0x31536e = 0; _0x31536e < 20; _0x31536e++) {
      for (var _0x537f5a = 0; _0x537f5a < 10; _0x537f5a++) {
        this.drawBlock(
          _0x537f5a,
          _0x31536e,
          this.g.matrix[_0x31536e][_0x537f5a],
          this.MAIN,
        );
      }
    }
  }
};
WebGLView.prototype.clearMainCanvas = function () {
  var _0x3daa04 = this.ctxs[0].gl;
  _0x3daa04.clear(_0x3daa04.COLOR_BUFFER_BIT);
};
WebGLView.prototype.clearHoldCanvas = function () {
  var _0x3416a4 = this.ctxs[this.HOLD].gl;
  _0x3416a4.clear(_0x3416a4.COLOR_BUFFER_BIT);
};
WebGLView.prototype.clearQueueCanvas = function () {
  var _0x4d9843 = this.ctxs[this.QUEUE].gl;
  _0x4d9843.clear(_0x4d9843.COLOR_BUFFER_BIT);
};
WebGLView.prototype.drawBlockOnCanvas = function (
  _0x569995,
  _0x3e7c21,
  _0x4981b5,
  _0x140478,
) {
  this.drawBlock(_0x569995, _0x3e7c21, _0x4981b5, _0x140478);
};
WebGLView.prototype.drawBrickOverlayOnCanvas = function (
  _0x3f1012,
  _0x4c511a,
  _0x34dd64,
) {};
WebGLView.prototype.drawBrickOverlay = function (
  _0xd0b336,
  _0x42da73,
  _0x37b090,
) {};
WebGLView.prototype.drawBlock = function (
  _0x2ac999,
  _0x178924,
  _0x12c7c5,
  _0x2f27db,
) {
  if (_0x12c7c5) {
    var _0x5e2143 = this.g.drawScale * this.g.block_size;
    var _0x3eb3f2 = this.ctxs[_0x2f27db];
    var _0x2a5705 = _0x3eb3f2.textureInfos[0];
    this.drawImage(
      _0x3eb3f2,
      _0x2a5705.texture,
      _0x2a5705.width,
      _0x2a5705.height,
      this.g.coffset[_0x12c7c5] * _0x2a5705.height,
      0,
      _0x2a5705.height,
      _0x2a5705.height,
      _0x2ac999 * this.g.block_size,
      _0x178924 * this.g.block_size,
      _0x5e2143,
      _0x5e2143,
    );
  }
};
WebGLView.prototype.drawGhostBlock = function (
  _0x37d44a,
  _0x2bd50c,
  _0x358716,
) {
  var _0x17d81a = this.ctxs[0];
  if (this.g.ghostSkinId === 0) {
    _0x17d81a.gl.uniform1f(_0x17d81a.globalAlpha, 0.5);
    this.drawBlock(_0x37d44a, _0x2bd50c, _0x358716, 0);
    _0x17d81a.gl.uniform1f(_0x17d81a.globalAlpha, 1);
  } else {
    var _0x138028 = this.g.drawScale * this.g.block_size;
    var _0x2aed1f = _0x17d81a.textureInfos[1];
    this.drawImage(
      _0x17d81a,
      _0x2aed1f.texture,
      _0x2aed1f.width,
      _0x2aed1f.height,
      (this.g.coffset[_0x358716] - 2) * _0x2aed1f.height,
      0,
      _0x2aed1f.height,
      _0x2aed1f.height,
      _0x37d44a * this.g.block_size,
      _0x2bd50c * this.g.block_size,
      _0x138028,
      _0x138028,
    );
  }
};
WebGLView.prototype.redrawRedBar = function (_0x2615fc) {
  if (_0x2615fc || this.g.redBar) {
    var _0x334e9b = this.ctxs[this.MAIN];
    var _0x4a1e77 = _0x334e9b.textureInfos[2];
    if (_0x2615fc) {
      _0x334e9b.gl.clear(_0x334e9b.gl.COLOR_BUFFER_BIT);
      this.g.redrawMatrix();
      this.g.drawGhostAndCurrent();
    }
    this.drawImage(
      _0x334e9b,
      _0x4a1e77.texture,
      _0x4a1e77.width,
      _0x4a1e77.height,
      0,
      0,
      1,
      1,
      240,
      (20 - this.g.redBar) * this.g.block_size,
      8,
      this.g.redBar * this.g.block_size,
    );
  }
};
WebGLView.prototype.drawClearLine = function (_0x2e799f, _0x58be9e) {
  var _0x161900 = this.ctxs[this.MAIN];
  var _0x5820cd = _0x161900.textureInfos[2];
  _0x161900.gl.uniform1f(_0x161900.globalAlpha, _0x58be9e);
  this.drawImage(
    _0x161900,
    _0x5820cd.texture,
    _0x5820cd.width,
    _0x5820cd.height,
    1,
    0,
    1,
    1,
    0,
    _0x2e799f * this.g.block_size,
    this.g.block_size * 10,
    this.g.block_size,
  );
  _0x161900.gl.uniform1f(_0x161900.globalAlpha, 1);
};
WebGLView.prototype.setAlpha = function (_0xfbc170) {
  var _0x47cbfb = this.ctxs[this.MAIN];
  _0x47cbfb.gl.uniform1f(_0x47cbfb.globalAlpha, _0xfbc170);
};
WebGLView.prototype.clearRect = function (
  _0x4fa445,
  _0x5efba6,
  _0xe148d4,
  _0xf60f8,
) {
  var _0x5c5add = this.ctxs[this.MAIN];
  var _0x41f911 = _0x5c5add.gl;
  _0x5efba6 = Math.ceil(_0x5c5add.elem.height - _0x5efba6 - _0xf60f8);
  _0x41f911.enable(_0x41f911.SCISSOR_TEST);
  _0x41f911.scissor(_0x4fa445, _0x5efba6, _0xe148d4, _0xf60f8);
  _0x41f911.clear(_0x41f911.COLOR_BUFFER_BIT);
  _0x41f911.disable(_0x41f911.SCISSOR_TEST);
  _0x41f911.clearColor(0, 0, 0, 0);
};
WebGLView.prototype.setupGif = function (_0x5aa027, _0x18c5d5) {
  this.videoOpts = _0x18c5d5;
  if (typeof gifler == "undefined") {
    let _0x18487c = CDN_URL("/js/vendor/gifler.min.js");
    includeScript(_0x18487c, this.realSetupGif.bind(this, _0x5aa027));
  } else {
    this.realSetupGif(_0x5aa027);
  }
};
WebGLView.prototype.realSetupGif = function (_0x12ce5a) {
  let _0x14cf46 = null;
  this.videoOpts.fpsUpdate = false;
  this.videoOpts.w = this.videoOpts.h = null;
  if (this.video && this.video.tagName === "canvas") {
    _0x14cf46 = this.video;
    try {
      document.body.removeChild(_0x14cf46);
    } catch (_0x450c95) {}
  } else {
    _0x14cf46 = document.createElement("canvas");
  }
  gifler(_0x12ce5a).frames(
    _0x14cf46,
    this.updateGifTexture.bind(this),
    true,
  );
  this.video = _0x14cf46;
  if (this.videoOpts.debug) {
    document.body.appendChild(_0x14cf46);
  }
};
WebGLView.prototype.updateGifTexture = function (
  _0x31e03d,
  _0x365568,
) {
  if (this.videoOpts.skinify) {
    if (this.videoOpts.w === null) {
      this.videoOpts.w = this.video.width;
      this.videoOpts.h = this.video.height;
      _0x31e03d.canvas.width = 576;
      _0x31e03d.canvas.height = 64;
    }
    let _0x1c0fe6 = [9, 8, 1, 2, 3, 4, 5, 6, 7];
    for (var _0x1a6b27 = 0; _0x1a6b27 < 9; ++_0x1a6b27) {
      _0x31e03d.globalCompositeOperation = "source-over";
      let _0x32ee60 = 64 / this.videoOpts.w;
      let _0x8037d3 = 64 / this.videoOpts.h;
      let _0xee7216 = _0x365568.x * _0x32ee60;
      let _0x26cbd6 = _0x365568.y * _0x8037d3;
      let _0x4208b9 = _0x365568.width * _0x32ee60;
      let _0x3eb0a1 = _0x365568.height * _0x8037d3;
      _0x31e03d.drawImage(
        _0x365568.buffer,
        _0x1a6b27 * 64 + _0xee7216,
        _0x26cbd6,
        _0x4208b9,
        _0x3eb0a1,
      );
      if (this.videoOpts.colorize) {
        let _0x53caeb = this.g.colorsV3[_0x1c0fe6[_0x1a6b27]];
        let _0x3ed6af = this.videoOpts.colorAlpha || 0.7;
        _0x31e03d.globalCompositeOperation = "source-atop";
        _0x31e03d.fillStyle =
          "rgba(" +
          _0x53caeb[0] * 255 +
          ", " +
          _0x53caeb[1] * 255 +
          ", " +
          _0x53caeb[2] * 255 +
          ", " +
          _0x3ed6af +
          ")";
        _0x31e03d.fillRect(_0x1a6b27 * 64, 0, 64, 64);
      }
    }
  } else {
    _0x31e03d.drawImage(
      _0x365568.buffer,
      _0x365568.x,
      _0x365568.y,
      _0x365568.width,
      _0x365568.height,
    );
  }
  this.updateTextureFromElem(
    0,
    this.video,
    this.video.width,
    this.video.height,
  );
  this.videoSkin = true;
};
WebGLView.prototype.setupVideo = function (_0x827a28, _0xbc7a41) {
  this.videoOpts = _0xbc7a41;
  this.videoOpts.fpsUpdate = true;
  this.videoSkin = false;
  const _0x5dc5d0 = document.createElement("video");
  var _0x44a6f7 = false;
  var _0x577e76 = false;
  var _0x51c711 = this;
  _0x5dc5d0.crossOrigin = "anonymous";
  _0x5dc5d0.loop = _0x5dc5d0.autoplay = true;
  _0x5dc5d0.muted = this.videoOpts.sound !== true;
  _0x5dc5d0.addEventListener(
    "playing",
    function () {
      _0x44a6f7 = true;
      _0x51c711.videoSkin = _0x44a6f7 && _0x577e76;
    },
    true,
  );
  _0x5dc5d0.addEventListener(
    "timeupdate",
    function () {
      _0x577e76 = true;
      _0x51c711.videoSkin = _0x44a6f7 && _0x577e76;
    },
    true,
  );
  _0x5dc5d0.addEventListener(
    "waiting",
    function () {
      _0x51c711.videoSkin = _0x44a6f7 = _0x577e76 = false;
    },
    true,
  );
  _0x5dc5d0.src = _0x827a28;
  _0x5dc5d0.play();
  this.video = _0x5dc5d0;
};
WebGLView.prototype.updateTexture = function (_0x5c8b1a) {
  if (this.videoSkin) {
    this.updateTextureFromElem(
      _0x5c8b1a,
      this.video,
      this.video.videoWidth,
      this.video.videoHeight,
    );
  }
};
WebGLView.prototype.updateTextureFromElem = function (
  _0x2efa07,
  _0x3d37bf,
  _0x513fcc,
  _0x5b0670,
) {
  for (var _0x5a33c7 = 0; _0x5a33c7 < this.ctxs.length; ++_0x5a33c7) {
    var _0x1cbe3f = this.ctxs[_0x5a33c7].gl;
    var _0x5e861f = this.ctxs[_0x5a33c7].textureInfos[_0x2efa07];
    _0x5e861f.width = _0x513fcc;
    _0x5e861f.height = _0x5b0670;
    if (this.ctxs[_0x5a33c7].boundTexture !== _0x5e861f.texture) {
      _0x1cbe3f.bindTexture(_0x1cbe3f.TEXTURE_2D, _0x5e861f.texture);
      this.ctxs[_0x5a33c7].boundTexture = _0x5e861f.texture;
    }
    _0x1cbe3f.texImage2D(
      _0x1cbe3f.TEXTURE_2D,
      0,
      _0x1cbe3f.RGBA,
      _0x1cbe3f.RGBA,
      _0x1cbe3f.UNSIGNED_BYTE,
      _0x3d37bf,
    );
  }
};
WebGLView.prototype.createFastFont = function () {
  return new FastFont();
};
FastFont.prototype.init = function (_0x2739f5) {
  var _0xfbeb60 = this;
  var _0x5d0439 = new Image();
  _0x5d0439.addEventListener("load", function () {
    var _0x55e041 = _0xfbeb60.ctx.gl;
    var _0x5ddafd = _0xfbeb60.ctx.textureInfo;
    _0x5ddafd.width = _0x5d0439.width;
    _0x5ddafd.height = _0x5d0439.height;
    _0x55e041.bindTexture(
      _0x55e041.TEXTURE_2D,
      _0xfbeb60.ctx.textureInfo.texture,
    );
    _0x55e041.texImage2D(
      _0x55e041.TEXTURE_2D,
      0,
      _0x55e041.RGBA,
      _0x55e041.RGBA,
      _0x55e041.UNSIGNED_BYTE,
      _0x5d0439,
    );
    _0x55e041.texParameteri(
      _0x55e041.TEXTURE_2D,
      _0x55e041.TEXTURE_MAG_FILTER,
      _0x55e041.LINEAR,
    );
    _0x55e041.texParameteri(
      _0x55e041.TEXTURE_2D,
      _0x55e041.TEXTURE_MIN_FILTER,
      _0x55e041.LINEAR,
    );
    _0x55e041.texParameteri(
      _0x55e041.TEXTURE_2D,
      _0x55e041.TEXTURE_WRAP_S,
      _0x55e041.CLAMP_TO_EDGE,
    );
    _0x55e041.texParameteri(
      _0x55e041.TEXTURE_2D,
      _0x55e041.TEXTURE_WRAP_T,
      _0x55e041.CLAMP_TO_EDGE,
    );
    _0x55e041.uniform2f(
      _0xfbeb60.ctx.u_texsize,
      _0x5d0439.width,
      _0x5d0439.height,
    );
    _0xfbeb60.ready = true;
    _0x2739f5();
  });
  _0x5d0439.crossOrigin = "anonymous";
  _0x5d0439.src = CDN_URL("/res/img/sdf2.png");
};
FastFont.prototype.resizeCanvas = function () {
  if (this.canvas.height < this.canvas.clientHeight) {
    this.canvas.height = this.canvas.clientHeight;
    this.ctx.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }
};
FastFont.prototype.drawText = function (_0x59f92d, _0x43030e) {
  var _0x264209 = this.ctx;
  var _0x5959bf = _0x264209.gl;
  var _0x499faa = this.fontSize;
  var _0x5cb111 = _0x499faa / 8;
  var _0x575ea9 = _0x499faa + _0x5cb111 * 2;
  var _0x3de434 = _0x499faa + _0x5cb111 * 2;
  var _0x1b58d0 = _0x499faa / 2 + _0x5cb111;
  var _0x5d9447 = _0x43030e / _0x499faa;
  var _0x742cea = {
    x: 0,
    y: _0x3de434 / 2 - _0x5cb111,
  };
  var _0x36a6a6 = 0;
  for (var _0x4baf76 = 0; _0x4baf76 < _0x59f92d.length; _0x4baf76++) {
    var _0x412905 = this.sdfs[_0x59f92d[_0x4baf76]];
    if (!_0x412905) {
      _0x412905 = this.sdfs["?"];
    }
    if (_0x4baf76 === this.MAX_STR_LEN) {
      _0x59f92d = _0x59f92d.substring(0, this.MAX_STR_LEN);
      break;
    }
    var _0x4928c2 = _0x412905.x;
    var _0x541833 = _0x412905.y;
    var _0x4d480c = _0x412905.w || _0x499faa * this.defaultGlyphW;
    this.verElem.set(
      [
        0 + (0 - _0x5cb111) * _0x5d9447,
        _0x742cea.y - _0x1b58d0 * _0x5d9447,
        0 + (0 - _0x5cb111 + _0x575ea9) * _0x5d9447,
        _0x742cea.y - _0x1b58d0 * _0x5d9447,
        0 + (0 - _0x5cb111) * _0x5d9447,
        _0x742cea.y + (_0x3de434 - _0x1b58d0) * _0x5d9447,
        0 + (0 - _0x5cb111 + _0x575ea9) * _0x5d9447,
        _0x742cea.y - _0x1b58d0 * _0x5d9447,
        0 + (0 - _0x5cb111) * _0x5d9447,
        _0x742cea.y + (_0x3de434 - _0x1b58d0) * _0x5d9447,
        0 + (0 - _0x5cb111 + _0x575ea9) * _0x5d9447,
        _0x742cea.y + (_0x3de434 - _0x1b58d0) * _0x5d9447,
      ],
      _0x36a6a6,
    );
    this.texElem.set(
      [
        _0x4928c2,
        _0x541833,
        _0x4928c2 + _0x575ea9,
        _0x541833,
        _0x4928c2,
        _0x541833 + _0x3de434,
        _0x4928c2 + _0x575ea9,
        _0x541833,
        _0x4928c2,
        _0x541833 + _0x3de434,
        _0x4928c2 + _0x575ea9,
        _0x541833 + _0x3de434,
      ],
      _0x36a6a6,
    );
    _0x36a6a6 += 12;
    _0x742cea.x = 0 + _0x4d480c * _0x5d9447;
  }
  _0x5959bf.bindBuffer(
    _0x5959bf.ARRAY_BUFFER,
    _0x264209.vertexBuffer,
  );
  _0x5959bf.bufferData(
    _0x5959bf.ARRAY_BUFFER,
    this.verElem,
    _0x5959bf.STATIC_DRAW,
  );
  _0x5959bf.bindBuffer(
    _0x5959bf.ARRAY_BUFFER,
    _0x264209.textureBuffer,
  );
  _0x5959bf.bufferData(
    _0x5959bf.ARRAY_BUFFER,
    this.texElem,
    _0x5959bf.STATIC_DRAW,
  );
  _0x264209.vertexBuffer.numItems = _0x264209.textureBuffer.numItems =
    _0x59f92d.length * 6;
};
FastFont.prototype.renderLines = function (_0xce6d3d) {
  this.resizeCanvas();
  var _0x87df32 = this.ctx.gl;
  var _0x5d5bf8 = this.ctx.elem.height;
  _0x87df32.clear(_0x87df32.COLOR_BUFFER_BIT);
  if (_0xce6d3d.length > this.availableLines) {
    this.availableLines = _0xce6d3d.length;
  }
  var _0x9a8df = _0x5d5bf8 / this.availableLines;
  for (var _0x38e233 = 0; _0x38e233 < _0xce6d3d.length; ++_0x38e233) {
    this.draw(
      _0xce6d3d[_0x38e233].value.toString(),
      0,
      _0x9a8df * _0x38e233,
    );
  }
};
FastFont.prototype.draw = function (_0x43766f, _0x2d64b0, _0x4a4e87) {
  if (this.ready) {
    var _0x22ac2b = this.ctx.gl;
    var _0x4f4a44 = this.ctx;
    this.drawText(_0x43766f, this.scale);
    Matrix.orthographic(
      0,
      _0x4f4a44.elem.width,
      _0x4f4a44.elem.height,
      0,
      -1,
      1,
      _0x4f4a44.m4,
    );
    Matrix.translate(
      _0x4f4a44.m4,
      _0x2d64b0,
      _0x4a4e87,
      0,
      _0x4f4a44.m4,
    );
    _0x22ac2b.uniformMatrix4fv(
      _0x4f4a44.u_matrix,
      false,
      _0x4f4a44.m4,
    );
    if (!this.glParamsSet) {
      this.glParamsSet = true;
      _0x22ac2b.activeTexture(_0x22ac2b.TEXTURE0);
      _0x22ac2b.bindTexture(
        _0x22ac2b.TEXTURE_2D,
        _0x4f4a44.textureInfo.texture,
      );
      _0x22ac2b.uniform1i(_0x4f4a44.u_texture, 0);
      _0x22ac2b.bindBuffer(
        _0x22ac2b.ARRAY_BUFFER,
        _0x4f4a44.vertexBuffer,
      );
      _0x22ac2b.vertexAttribPointer(
        _0x4f4a44.a_pos,
        2,
        _0x22ac2b.FLOAT,
        false,
        0,
        0,
      );
      _0x22ac2b.bindBuffer(
        _0x22ac2b.ARRAY_BUFFER,
        _0x4f4a44.textureBuffer,
      );
      _0x22ac2b.vertexAttribPointer(
        _0x4f4a44.a_texcoord,
        2,
        _0x22ac2b.FLOAT,
        false,
        0,
        0,
      );
      _0x22ac2b.uniform4fv(
        _0x4f4a44.u_color,
        [
          0.5019607843137255, 0.5019607843137255, 0.5019607843137255,
          1,
        ],
      );
      _0x22ac2b.uniform1f(_0x4f4a44.u_buffer, 0.75);
      _0x22ac2b.uniform1f(
        _0x4f4a44.u_gamma,
        (this.gamma * 1.4142) / this.scale,
      );
    }
    _0x22ac2b.drawArrays(
      _0x22ac2b.TRIANGLES,
      0,
      _0x4f4a44.vertexBuffer.numItems,
    );
  }
};
GameCore.prototype.randomizerFactory = function (
  _0x5df522,
  _0x2aa985,
) {
  let _0x3e4a0a = this.blockSets[this.R.baseBlockSet].blocks.length;
  let _0xecfd61 = null;
  let _0x466e94 = _0x2aa985 || this.blockRNG;
  switch (_0x5df522) {
    case 0:
    case 13:
    default:
      _0xecfd61 = new Bag(_0x466e94, _0x3e4a0a, 1);
      break;
    case 1:
      _0xecfd61 = new Bag(_0x466e94, _0x3e4a0a, 2);
      break;
    case 2:
      _0xecfd61 = new Classic(_0x466e94, _0x3e4a0a);
      break;
    case 3:
      _0xecfd61 = new OneBlock(_0x466e94, _0x3e4a0a, 1, null);
      break;
    case 4:
      _0xecfd61 = new OneBlock(_0x466e94, _0x3e4a0a, 2, null);
      break;
    case 5:
      _0xecfd61 = new OneBlock(_0x466e94, _0x3e4a0a, _0x3e4a0a, 1);
      break;
    case 6:
      _0xecfd61 = new OneBlock(
        _0x466e94,
        _0x3e4a0a,
        _0x3e4a0a * 2,
        2,
      );
      break;
    case 7:
      _0xecfd61 = new C2Sim(_0x466e94, _0x3e4a0a);
      break;
    case 8:
      _0xecfd61 = new Repeated(new Bag(_0x466e94, _0x3e4a0a, 1), 7);
      break;
    case 9:
      _0xecfd61 = new BsBlock(
        new Bag(_0x466e94, _0x3e4a0a, 1),
        [2, 4],
      );
      break;
    case 10:
      _0xecfd61 = new BigBlockRand(
        new Bag(_0x466e94, _0x3e4a0a, 1),
        2,
      );
      break;
    case 11:
      _0xecfd61 = new ConstBlock(2, 0);
      break;
    case 12:
      _0xecfd61 = new ConstBlock(0, 5);
  }
  return _0xecfd61;
};
GameCore.prototype.initRandomizer = function (_0x3523c6) {
  this.randomizer = this.randomizerFactory(_0x3523c6);
  if (this.ISGAME && this.Replay) {
    if (_0x3523c6 !== 0) {
      this.Replay.config.rnd = _0x3523c6;
    } else if ("rnd" in this.Replay.config) {
      delete this.Replay.config.rnd;
    }
  }
};
GameCore.prototype.getRandomizerBlock = function (_0x280441) {
  let _0x580db9 = (_0x280441 =
    _0x280441 || this.randomizer).getBlock();
  if (_0x580db9.set === 0) {
    _0x580db9.set = this.R.baseBlockSet;
  } else if (_0x580db9.set === -1) {
    _0x580db9.set = 0;
  }
  if (this.temporaryBlockSet !== null) {
    _0x580db9.set = this.temporaryBlockSet;
    this.temporaryBlockSet = null;
  }
  return _0x580db9;
};
GameCore.prototype.generateLiveQueue = function () {
  this.blockRNG = alea(this.blockSeed);
  this.RNG = alea(this.blockSeed);
  this.Replay.config.seed = this.blockSeed;
  this.initRandomizer(this.conf[0].rnd);
  this.generateQueue();
};
GameCore.prototype.getBlockFromQueue = function () {
  if (this.queue.length === 0) {
    if (this.ISGAME && this.isPmode(false) === 9) {
      this.Caption.gameWarning(i18n.noBlocks, i18n.noBlocks2);
    }
    this.GameOver();
    return this.activeBlock;
  }
  var _0x5b37a0 = this.queue.splice(0, 1)[0];
  this.refillQueue();
  this.updateQueueBox();
  return _0x5b37a0;
};
GameCore.prototype.checkIntersection = function (
  _0x4b74f6,
  _0x1a2dfd,
  _0x13f8b8,
) {
  _0x13f8b8 = _0x13f8b8 === null ? this.activeBlock.rot : _0x13f8b8;
  let _0xb1e574 = this.blockSets[this.activeBlock.set];
  let _0x303343 = _0xb1e574.blocks[this.activeBlock.id].blocks;
  let _0x1349a6 =
    _0xb1e574.blocks[this.activeBlock.id].blocks[_0x13f8b8].length;
  for (var _0x3f380e = 0; _0x3f380e < _0x1349a6; _0x3f380e++) {
    for (var _0x4f5a78 = 0; _0x4f5a78 < _0x1349a6; _0x4f5a78++) {
      if (_0x303343[_0x13f8b8][_0x3f380e][_0x4f5a78] > 0) {
        if (_0x1a2dfd + _0x3f380e >= 20) {
          return true;
        }
        if (
          _0x4b74f6 + _0x4f5a78 < 0 ||
          _0x4b74f6 + _0x4f5a78 >= 10
        ) {
          return true;
        }
        if (
          _0x1a2dfd + _0x3f380e >= 0 &&
          this.matrix[_0x1a2dfd + _0x3f380e][_0x4b74f6 + _0x4f5a78] >
            0
        ) {
          return true;
        }
      }
    }
  }
  return false;
};
GameCore.prototype.setCurrentPieceToDefaultPos = function () {
  let _0x27261f =
    this.blockSets[this.activeBlock.set].blocks[this.activeBlock.id];
  let _0x161c92 = _0x27261f.blocks[0].length;
  this.activeBlock.rot = 0;
  this.activeBlock.pos.x = _0x27261f.spawn[0];
  this.activeBlock.pos.y = _0x27261f.spawn[1];
  if (this.activeBlock.set === 0) {
    var _0x130afe = _0x27261f.blocks[0][-this.activeBlock.pos.y];
    if (
      (this.matrix[0][3] && _0x130afe[0]) ||
      (this.matrix[0][4] && _0x130afe[1]) ||
      (this.matrix[0][5] && _0x130afe[2]) ||
      (this.matrix[0][6] && _0x130afe[3])
    ) {
      this.activeBlock.pos.y--;
    }
  } else {
    while (
      this.checkIntersection(
        this.activeBlock.pos.x,
        this.activeBlock.pos.y,
        null,
      )
    ) {
      this.activeBlock.pos.y--;
    }
  }
  const _0x2fb6a4 = -(1 + this.activeBlock.pos.y);
  const _0x2e0177 =
    this.ISGAME &&
    this.ModeManager &&
    this.isPmode(false) === 9 &&
    this.play &&
    this.ModeManager.preventTopout;
  if (_0x2fb6a4 >= 0 && _0x2fb6a4 < _0x161c92 && !_0x2e0177) {
    for (var _0x339a70 = 0; _0x339a70 < _0x161c92; ++_0x339a70) {
      if (
        _0x27261f.blocks[this.activeBlock.rot][_0x2fb6a4][
          _0x339a70
        ] &&
        this.deadline[this.activeBlock.pos.x + _0x339a70]
      ) {
        this.GameOver();
        break;
      }
    }
  }
  if (
    this.ISGAME &&
    this.ModeManager &&
    this.isPmode(false) === 9 &&
    this.play
  ) {
    this.ModeManager.on(this.ModeManager.SPAWN);
  }
};
GameCore.prototype.centerColumnCheck = function (
  _0x3d6170,
  _0x2960e2,
) {
  let _0x2dede5 = this.activeBlock.id;
  let _0xa72dd6 = false;
  return (
    !(_0x2960e2 < 0) &&
    (_0x2dede5 === 3 || _0x2dede5 === 4
      ? this.activeBlock.rot === 0
        ? (_0xa72dd6 =
            (this.matrix[_0x2960e2][_0x3d6170 + 1] > 0 ||
              this.matrix[_0x2960e2 + 2][_0x3d6170 + 1] > 0) &&
            (!(this.matrix[_0x2960e2 + 2][_0x3d6170 + 1] > 0) ||
              !(
                this.matrix[_0x2960e2][
                  _0x3d6170 + (((_0x2dede5 === 4) * 2) | 0)
                ] > 0
              )))
        : this.activeBlock.rot === 3 &&
          (_0xa72dd6 =
            this.matrix[_0x2960e2][_0x3d6170 + 1] > 0 ||
            this.matrix[_0x2960e2 + 1][_0x3d6170 + 1] > 0)
      : _0x2dede5 === 2 &&
        ((this.activeBlock.rot !== 0 && this.activeBlock.rot !== 2) ||
          (_0xa72dd6 = this.matrix[_0x2960e2 + 1][_0x3d6170] > 0)),
    _0xa72dd6)
  );
};
GameCore.prototype.rotateCurrentBlock = function (_0x1f4bf2) {
  if (_0x1f4bf2 === 2) {
    this.finesse += 2;
    ++this.used180;
  } else {
    ++this.finesse;
  }
  let _0x597eb4 =
    _0x1f4bf2 === -1 ? "-1" : _0x1f4bf2 === 1 ? "1" : "2";
  let _0x3bc6c3 = this.activeBlock.rot + _0x1f4bf2;
  _0x3bc6c3 = _0x3bc6c3 === -1 ? (_0x3bc6c3 = 3) : _0x3bc6c3 % 4;
  let _0x23bb0f =
    this.blockSets[this.activeBlock.set].blocks[this.activeBlock.id];
  let _0x4e26ef = _0x23bb0f.kicks[this.activeBlock.rot][_0x597eb4];
  let _0x3478f0 = _0x4e26ef.length;
  if (
    this.activeBlock.set !== 3 ||
    !this.centerColumnCheck(
      this.activeBlock.pos.x,
      this.activeBlock.pos.y,
    )
  ) {
    for (let _0x13e68f = 0; _0x13e68f < _0x3478f0; _0x13e68f++) {
      let _0x2573d4 = _0x4e26ef[_0x13e68f][0];
      let _0x2d7666 = _0x4e26ef[_0x13e68f][1];
      if (
        !this.checkIntersection(
          this.activeBlock.pos.x + _0x2573d4,
          this.activeBlock.pos.y - _0x2d7666,
          _0x3bc6c3,
        )
      ) {
        this.spinPossible = true;
        if (_0x23bb0f.id === 2) {
          this.tspinType = _0x3bc6c3 * 10 + _0x13e68f;
        } else if (_0x23bb0f.id === 50) {
          if (_0x1f4bf2 === 2) {
            return;
          }
          if (_0x3bc6c3 === 3 && _0x13e68f < 14) {
            return;
          }
          if (
            ((_0x3bc6c3 === 1 && this.activeBlock.rot === 0) ||
              (_0x3bc6c3 === 2 && this.activeBlock.rot === 1)) &&
            _0x13e68f !== 3
          ) {
            return;
          }
          if (
            ((_0x3bc6c3 === 0 && this.activeBlock.rot === 1) ||
              (_0x3bc6c3 === 1 && this.activeBlock.rot === 2)) &&
            _0x13e68f !== 11
          ) {
            return;
          }
          if (this.activeBlock.rot === 3 && _0x3bc6c3 !== 0) {
            return;
          }
        }
        this.activeBlock.rot = _0x3bc6c3;
        this.activeBlock.pos.x += _0x2573d4;
        this.activeBlock.pos.y -= _0x2d7666;
        if (_0x2d7666 > 0) {
          this.lockDelayActive = false;
          this.timer = 0;
        }
        if (this.ISGAME) {
          this.playSound("rotate");
        }
        break;
      }
    }
    this.updateGhostPiece(true);
    this.redraw();
  }
};
GameCore.prototype.addSolidGarbage = function () {
  if (this.solidHeight === 20) {
    return;
  }
  let _0x4ce597 = [9, 9, 9, 9, 9, 9, 9, 9, 9, 9];
  this.deadline = this.matrix[0].slice(0);
  var _0x537076 = this.matrix.length;
  for (var _0x3e399a = 0; _0x3e399a < _0x537076; _0x3e399a++) {
    this.matrix[_0x3e399a] =
      _0x537076 - _0x3e399a > 1
        ? this.matrix[_0x3e399a + 1].slice(0)
        : _0x4ce597.slice(0);
  }
  this.solidHeight++;
  if (this.ISGAME) {
    this.Replay.add(
      new ReplayAction(
        this.Replay.Action.SGARBAGE_ADD,
        this.timestamp(),
      ),
    );
  }
};
GameCore.prototype.gravityStep = function (_0xda41ff, _0x1cba96) {
  if (
    this.checkIntersection(
      this.activeBlock.pos.x,
      this.activeBlock.pos.y + 1,
      null,
    )
  ) {
    if (this.ISGAME && !this.lockDelayActive) {
      this.lockDelayActive = true;
      this.lockDelayActivated = _0x1cba96;
      this.lastAction = _0x1cba96;
      this.playSound("land");
    }
    return 0;
  } else {
    this.activeBlock.pos.y++;
    this.lockDelayActive = false;
    this.spinPossible = false;
    if (_0xda41ff) {
      return 1 + this.gravityStep(_0xda41ff - 1, _0x1cba96);
    } else {
      return 1;
    }
  }
};
GameCore.prototype.holdBlock = function () {
  if (!this.holdUsedAlready && this.R.holdEnabled) {
    let _0x5c2723 = null;
    if (this.ISGAME) {
      _0x5c2723 = this.timestamp();
      this.Replay.add(
        new ReplayAction(this.Replay.Action.HOLD_BLOCK, _0x5c2723),
      );
    }
    this.lockDelayActive = false;
    this.holdUsedAlready = true;
    if (this.blockInHold === null) {
      this.blockInHold = this.activeBlock;
      this.getNextBlock(_0x5c2723);
    } else {
      let _0x510dac = this.blockInHold;
      this.blockInHold = this.activeBlock;
      this.activeBlock = _0x510dac;
      this.setCurrentPieceToDefaultPos();
      if (this.ISGAME) {
        this.lastGeneration = _0x5c2723;
        if (this.VSEenabled && this.VSFXset.spawns) {
          this.playCurrentPieceSound();
        }
      }
    }
    this.updateGhostPiece(true);
    this.totalKeyPresses++;
    this.gamedata.holds++;
    if (this.GameStats) {
      this.GameStats.get("HOLD").set(this.gamedata.holds);
    }
    if (this.ISGAME) {
      if (this.ModeManager && this.isPmode(false) === 9) {
        this.ModeManager.on(this.ModeManager.HOLD_RETRIEVED);
      }
      this.checkAutoRepeat(_0x5c2723, false);
      this.redrawHoldBox();
      this.redraw();
      this.playSound("hold");
      if (this.R.infHold || this.botPlacement) {
        this.holdUsedAlready = false;
      }
    } else {
      this.v.onBlockHold();
    }
  }
};
GameCore.prototype.moveBlockToTheWall = function (_0x59dcbe) {
  var _0x56b2f8 = 0;
  for (
    ;
    !this.checkIntersection(
      this.activeBlock.pos.x + _0x59dcbe,
      this.activeBlock.pos.y,
      null,
    );
  ) {
    this.activeBlock.pos.x = this.activeBlock.pos.x + _0x59dcbe;
    _0x56b2f8 += 1;
  }
  if (_0x56b2f8) {
    this.updateGhostPiece(true);
    this.redraw();
  }
  return _0x56b2f8;
};
GameCore.prototype.updateGhostPiece = function (_0x1b4cb3) {
  if (
    _0x1b4cb3 ||
    (this.ghostEnabled &&
      (!this.ISGAME ||
        (this.v.ghostEnabled && !this.v.redrawBlocked)))
  ) {
    for (
      var _0x30b5d0 = this.activeBlock.pos.y;
      _0x30b5d0 <= 20;
      ++_0x30b5d0
    ) {
      if (
        this.checkIntersection(
          this.activeBlock.pos.x,
          _0x30b5d0,
          null,
        )
      ) {
        this.ghostPiece.pos.x = this.activeBlock.pos.x;
        this.ghostPiece.pos.y = _0x30b5d0 - 1;
        break;
      }
    }
  }
};
GameCore.prototype.checkTSpin = function (_0x56f0f2) {
  let _0x13b95e = 0;
  let _0x4db81d = 0;
  let _0x58666e = this.activeBlock.rot;
  let _0x1a9669 = this.activeBlock.pos.x;
  let _0x568a51 = this.activeBlock.pos.y;
  if (_0x56f0f2 === 202) {
    if (this.activeBlock.rot !== 2) {
      --_0x568a51;
    }
    _0x58666e = (this.activeBlock.rot + 2) % 4;
  }
  if (_0x568a51 < -2) {
    return false;
  }
  switch (_0x58666e) {
    case 0:
      if (_0x568a51 >= -1) {
        _0x13b95e =
          (this.matrix[_0x568a51 + 1][_0x1a9669] > 0) +
          (this.matrix[_0x568a51 + 1][_0x1a9669 + 2] > 0);
      } else if (_0x568a51 === -2) {
        _0x13b95e =
          (this.deadline[_0x1a9669] > 0) +
          (this.deadline[_0x1a9669 + 2] > 0);
      }
      _0x4db81d =
        _0x568a51 === 17
          ? 2
          : (this.matrix[_0x568a51 + 3][_0x1a9669] > 0) +
            (this.matrix[_0x568a51 + 3][_0x1a9669 + 2] > 0);
      break;
    case 1:
      if (_0x1a9669 === -1) {
        _0x4db81d = 2;
      }
      if (_0x568a51 >= -1) {
        _0x13b95e =
          (this.matrix[_0x568a51 + 1][_0x1a9669 + 2] > 0) +
          (this.matrix[_0x568a51 + 3][_0x1a9669 + 2] > 0);
        if (!_0x4db81d) {
          _0x4db81d =
            (this.matrix[_0x568a51 + 1][_0x1a9669] > 0) +
            (this.matrix[_0x568a51 + 3][_0x1a9669] > 0);
        }
      } else if (_0x568a51 === -2) {
        _0x13b95e =
          (this.deadline[_0x1a9669 + 2] > 0) +
          (this.matrix[_0x568a51 + 3][_0x1a9669 + 2] > 0);
        if (!_0x4db81d) {
          _0x4db81d =
            (this.deadline[_0x1a9669] > 0) +
            (this.matrix[_0x568a51 + 3][_0x1a9669] > 0);
        }
      }
      break;
    case 2:
      if (_0x568a51 >= -1) {
        _0x4db81d =
          (this.matrix[_0x568a51 + 1][_0x1a9669] > 0) +
          (this.matrix[_0x568a51 + 1][_0x1a9669 + 2] > 0);
      } else if (_0x568a51 === -2) {
        _0x4db81d =
          (this.deadline[_0x1a9669] > 0) +
          (this.deadline[_0x1a9669 + 2] > 0);
      }
      _0x13b95e =
        _0x568a51 === 17
          ? 2
          : (this.matrix[_0x568a51 + 3][_0x1a9669] > 0) +
            (this.matrix[_0x568a51 + 3][_0x1a9669 + 2] > 0);
      break;
    case 3:
      if (_0x1a9669 === 8) {
        _0x4db81d = 2;
      }
      if (_0x568a51 >= -1) {
        _0x13b95e =
          (this.matrix[_0x568a51 + 1][_0x1a9669] > 0) +
          (this.matrix[_0x568a51 + 3][_0x1a9669] > 0);
        if (!_0x4db81d) {
          _0x4db81d =
            (this.matrix[_0x568a51 + 1][_0x1a9669 + 2] > 0) +
            (this.matrix[_0x568a51 + 3][_0x1a9669 + 2] > 0);
        }
      } else if (_0x568a51 === -2) {
        _0x13b95e =
          (this.deadline[_0x1a9669] > 0) +
          (this.matrix[_0x568a51 + 3][_0x1a9669] > 0);
        if (!_0x4db81d) {
          _0x4db81d =
            (this.deadline[_0x1a9669 + 2] > 0) +
            (this.matrix[_0x568a51 + 3][_0x1a9669 + 2] > 0);
        }
      }
  }
  this.spinPossible = _0x13b95e === 2 && _0x4db81d >= 1;
  this.spinMiniPossible = _0x13b95e === 1 && _0x4db81d === 2;
};
GameCore.prototype.checkAllSpinImmobile = function () {
  let _0x2b2c61 = this.activeBlock.pos.x;
  let _0x4c6dc4 = this.activeBlock.pos.y;
  this.spinPossible =
    this.checkIntersection(_0x2b2c61 - 1, _0x4c6dc4, null) &&
    this.checkIntersection(_0x2b2c61 + 1, _0x4c6dc4, null) &&
    this.checkIntersection(_0x2b2c61, _0x4c6dc4 - 1, null);
};
GameCore.prototype.checkAllSpin = function (_0x4d08bb) {
  let _0x38c299 = this.blockSets[this.activeBlock.set];
  if (!_0x38c299.allspin) {
    return;
  }
  let _0x257406 = _0x38c299.allspin[_0x4d08bb];
  if (!_0x257406) {
    return;
  }
  let _0x38f30a = this.activeBlock.pos.x;
  let _0x18db65 = this.activeBlock.pos.y;
  let _0x509bec = _0x257406[this.activeBlock.rot][0];
  let _0xff3894 = _0x257406[this.activeBlock.rot][1];
  let _0x597ebc = this;
  let _0x2f31ea = function (_0x2a05a5) {
    let _0x557945 = 0;
    for (
      let _0x54ed24 = 0;
      _0x54ed24 < _0x2a05a5.length;
      _0x54ed24 += 2
    ) {
      let _0x247de0 = _0x38f30a + _0x2a05a5[_0x54ed24];
      let _0x1fdcb7 = _0x18db65 + _0x2a05a5[_0x54ed24 + 1];
      if (
        _0x247de0 < 0 ||
        _0x247de0 >= 10 ||
        _0x1fdcb7 < 0 ||
        _0x1fdcb7 >= 20 ||
        _0x597ebc.matrix[_0x1fdcb7][_0x247de0] > 0
      ) {
        ++_0x557945;
      }
    }
    return _0x557945;
  };
  if (_0x2f31ea(_0x509bec) !== _0x509bec.length / 2) {
    return;
  }
  let _0x122cfc = 0;
  if (Array.isArray(_0xff3894[0])) {
    for (
      let _0x5e3df6 = 0;
      _0x5e3df6 < _0xff3894.length;
      _0x5e3df6++
    ) {
      if (_0x2f31ea(_0xff3894[_0x5e3df6])) {
        _0x122cfc++;
      }
    }
  } else {
    _0x122cfc = _0x2f31ea(_0xff3894);
  }
  this.spinPossible = true;
  if (_0x122cfc == 2) {
  } else {
    if (_0x122cfc != 1) {
      return;
    }
    this.spinMiniPossible = true;
  }
};
GameCore.prototype.checkLineClears = function (_0x45abcd) {
  let _0x23e2a5 = 0;
  let _0x12d91a = -1;
  let _0x2b7d9c = 0;
  let _0x33b01e = 0;
  let _0x1ccaaa = false;
  let _0x4f8a6c = 0;
  let _0x56f5d8 = 0;
  let _0x200408 = [];
  let _0x56086c = null;
  let _0x105f70 =
    this.blockSets[this.activeBlock.set].blocks[this.activeBlock.id];
  let _0x31022d = "";
  this.wasBack2Back = this.isBack2Back;
  this.spinMiniPossible = false;
  if (!this.ISGAME && this.pmode === 3) {
    _0x56f5d8 = this.countGarbageHeight();
  }
  if (this.R.clearLines) {
    if (this.spinPossible && this.R.allSpin !== 1) {
      if (_0x105f70.id === 2 || _0x105f70.id === 202) {
        this.checkTSpin(_0x105f70.id);
      } else if (this.R.allSpin === 2) {
        this.spinPossible = false;
        this.checkAllSpin(_0x105f70.id);
      } else {
        this.spinPossible = false;
      }
    }
    for (var _0x513e6d = 0; _0x513e6d < 10; ++_0x513e6d) {
      if (this.deadline[_0x513e6d] !== 0) {
        ++_0x2b7d9c;
      } else if (_0x2b7d9c > 0) {
        break;
      }
    }
    if (_0x2b7d9c === 10) {
      this.deadline = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      ++_0x23e2a5;
    } else {
      _0x4f8a6c += _0x2b7d9c;
    }
    for (var _0x1c582f = 0; _0x1c582f < 20; _0x1c582f++) {
      _0x2b7d9c = 0;
      _0x33b01e = 0;
      let _0x3dca0a = false;
      for (_0x513e6d = 0; _0x513e6d < 10; _0x513e6d++) {
        let _0x147207 = this.matrix[_0x1c582f][_0x513e6d];
        if (_0x147207 === 9) {
          _0x3dca0a = true;
        } else if (_0x147207 !== 0) {
          _0x2b7d9c++;
          _0x33b01e |= _0x147207;
        } else if (_0x4f8a6c + _0x2b7d9c > 0) {
          break;
        }
      }
      if (_0x2b7d9c === 10 && !_0x3dca0a) {
        if (this.R.clearDelay) {
          if (_0x56086c === null) {
            _0x56086c = copyMatrix(this.matrix);
          }
          _0x200408.push(_0x1c582f);
        }
        if (this.matrix[_0x1c582f].indexOf(8) >= 0) {
          this.gamedata.garbageCleared++;
        }
        for (var _0x4a851d = _0x1c582f; _0x4a851d > 0; _0x4a851d--) {
          this.matrix[_0x4a851d] = this.matrix[_0x4a851d - 1];
        }
        this.matrix[0] = this.deadline.slice(0);
        this.deadline = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        _0x2b7d9c = 0;
        _0x23e2a5++;
        _0x12d91a = _0x1c582f;
        if (
          this.ISGAME &&
          this.isPmode(false) === 6 &&
          this.MapManager.mapData.finish ===
            this.MapManager.FINISH_STANDARD
        ) {
          this.MapManager.lineCleared(_0x1c582f);
        }
        if (_0x33b01e & 16) {
          _0x1ccaaa = true;
        }
      }
      _0x4f8a6c += _0x2b7d9c;
    }
    if (_0x23e2a5 > 0) {
      this.gamedata.lines += _0x23e2a5;
      if (this.GameStats) {
        this.GameStats.get("LINES").set(this.gamedata.lines);
      }
      var _0x44c711 = 0;
      var _0x55b2e1 = null;
      switch (_0x23e2a5) {
        case 1:
          this.gamedata.singles++;
          _0x44c711 = this.linesAttack[1];
          if (this.spinPossible) {
            if (this.debug) {
              _0x31022d = "T-Spin Single";
            }
            _0x55b2e1 = this.Scoring.A.TSPIN_SINGLE;
            _0x44c711 = this.linesAttack[7];
            if (this.isBack2Back) {
              this.gamedata.B2B += 1;
              _0x44c711 += this.linesAttack[10];
            } else {
              this.isBack2Back = true;
            }
          } else if (this.spinMiniPossible) {
            _0x55b2e1 = this.Scoring.A.TSPIN_MINI_SINGLE;
            if (this.isBack2Back) {
              this.gamedata.B2B += 1;
            } else {
              this.isBack2Back = true;
            }
            _0x44c711 = this.linesAttack[8];
            if (this.debug) {
              _0x31022d = "T-Spin Mini Single";
            }
          } else {
            this.isBack2Back = false;
            _0x55b2e1 = this.Scoring.A.CLEAR1;
          }
          break;
        case 2:
          this.gamedata.doubles++;
          _0x44c711 = this.linesAttack[2];
          if (this.spinPossible || this.spinMiniPossible) {
            this.gamedata.TSD++;
            _0x44c711 = this.linesAttack[5];
            _0x55b2e1 = this.Scoring.A.TSPIN_DOUBLE;
            if (this.isBack2Back) {
              this.gamedata.B2B += 1;
              _0x44c711 += this.linesAttack[10];
            } else {
              this.isBack2Back = true;
            }
            if (this.debug) {
              _0x31022d = "T-Spin Double";
            }
          } else {
            this.isBack2Back = false;
            _0x55b2e1 = this.Scoring.A.CLEAR2;
          }
          break;
        case 3:
          this.gamedata.triples++;
          _0x44c711 = this.linesAttack[3];
          if (
            (!this.spinPossible && !this.spinMiniPossible) ||
            (_0x105f70.id !== 2 && _0x105f70.id !== 50)
          ) {
            this.isBack2Back = false;
            _0x55b2e1 = this.Scoring.A.CLEAR3;
          } else {
            _0x44c711 = this.linesAttack[6];
            _0x55b2e1 = this.Scoring.A.TSPIN_TRIPLE;
            if (this.isBack2Back) {
              this.gamedata.B2B += 1;
              _0x44c711 += this.linesAttack[10];
            } else {
              this.isBack2Back = true;
            }
            if (this.debug) {
              _0x31022d = "T-Spin Triple";
            }
          }
          break;
        case 4:
          this.gamedata.tetrises++;
          _0x55b2e1 = this.Scoring.A.CLEAR4;
          _0x44c711 = this.linesAttack[4];
          if (this.isBack2Back) {
            this.gamedata.B2B += 1;
            _0x44c711 += this.linesAttack[10];
          } else {
            this.isBack2Back = true;
          }
          if (this.debug) {
            _0x31022d = "Tetris";
          }
          break;
        default:
          this.gamedata.tetrises++;
          _0x55b2e1 = this.Scoring.A.CLEAR5;
          _0x44c711 = this.linesAttack[6];
          if (this.isBack2Back) {
            this.gamedata.B2B += 1;
            _0x44c711 += this.linesAttack[10];
          } else {
            this.isBack2Back = true;
          }
          if (this.debug) {
            _0x31022d = "Multitris (" + _0x23e2a5 + ")";
          }
      }
      if (this.R.allSpin && this.spinPossible) {
        if (
          this.excludedBlocksAS &&
          this.excludedBlocksAS.length &&
          this.excludedBlocksAS.indexOf(_0x105f70.name) !== -1
        ) {
          _0x44c711 = 0;
          if (this.debug) {
            _0x31022d = "Ignored " + _0x105f70.name + "-Spin";
          }
        } else if (_0x105f70.id !== 2) {
          if (this.R.allSpin === 1) {
            _0x55b2e1 = this.Scoring.A.TSPIN_TRIPLE;
            if (_0x23e2a5 >= 4) {
              _0x44c711 = this.linesAttack[6] + 1;
            } else if (_0x23e2a5 === 3) {
              _0x44c711 = this.linesAttack[6];
            } else if (_0x23e2a5 === 2) {
              _0x44c711 = this.linesAttack[5];
              _0x55b2e1 = this.Scoring.A.TSPIN_DOUBLE;
            } else {
              _0x44c711 = this.linesAttack[7];
              _0x55b2e1 = this.Scoring.A.TSPIN_SINGLE;
            }
          } else {
            _0x44c711 = this.spinMiniPossible
              ? Math.min(2, _0x23e2a5)
              : Math.min(5, _0x23e2a5 * 2);
          }
          if (this.wasBack2Back) {
            _0x44c711 += this.linesAttack[10];
          }
          this.isBack2Back = true;
          if (this.debug && this.ISGAME) {
            _0x31022d =
              _0x105f70.name +
              "-Spin " +
              (_0x23e2a5 <= 4
                ? this.multipleNames[_0x23e2a5 - 1]
                : this.multipleNames[4]);
            if (this.spinMiniPossible) {
              _0x31022d += " Mini";
            }
            if (this.wasBack2Back) {
              _0x31022d = "B2B " + _0x31022d;
            }
          }
        }
      }
      if (_0x55b2e1 >= 8 && _0x55b2e1 <= 11) {
        this.gamedata.wasted--;
        this.gamedata.tspins++;
      }
      this.score(_0x55b2e1);
      let _0x223a89 = _0x55b2e1;
      if (_0x4f8a6c === 0) {
        this.gamedata.PCs++;
        _0x44c711 = this.linesAttack[9];
        _0x223a89 = this.Scoring.A.PERFECT_CLEAR;
        if (this.debug) {
          _0x31022d = "Perfect Clear";
        }
        this.score(_0x223a89);
        if (
          this.ISGAME &&
          this.isPmode(false) === 6 &&
          this.MapManager.mapData.finish ===
            this.MapManager.FINISH_BY_PC
        ) {
          this.practiceModeCompleted(_0x45abcd);
        }
      }
      if (
        this.ISGAME &&
        this.isPmode(false) === 6 &&
        this.MapManager.mapData.finish ===
          this.MapManager.FINISH_STANDARD &&
        this.MapManager.mapLines.length === 0
      ) {
        this.practiceModeCompleted(_0x45abcd);
      }
      this.fourWideFlag =
        this.ISGAME &&
        this.Live.noFourWide &&
        ((this.fourWideFlag && this.comboCounter >= 0) ||
          this.is4W(_0x12d91a));
      this.comboCounter++;
      if (this.comboCounter > 0) {
        this.score(this.Scoring.A.COMBO, this.comboCounter);
      }
      if (this.comboCounter > this.gamedata.maxCombo) {
        this.gamedata.maxCombo = this.comboCounter;
      }
      var _0x14ac76 = this.getComboAttack(this.comboCounter);
      this.gamedata.linesSent += _0x44c711 + _0x14ac76;
      if ((_0x44c711 > 0 || _0x14ac76 > 0) && this.GameStats) {
        this.GameStats.get("ATTACK").set(this.gamedata.linesSent);
      }
      if (this.ISGAME) {
        let _0x418870 = [
          _0x223a89,
          _0x55b2e1,
          this.wasBack2Back && this.isBack2Back,
          this.comboCounter,
        ];
        this.playSound(this.SFXset.getClearSFX(..._0x418870), 1);
        if (this.VSEenabled) {
          this.playSound(this.VSFXset.getClearSFX(..._0x418870), 2);
        }
        if (this.debug && _0x31022d) {
          this.Live.showInChat("", _0x31022d);
        }
      }
      if (
        this.R.allSpin &&
        _0x105f70.id !== 2 &&
        _0x55b2e1 >= this.Scoring.A.TSPIN_SINGLE
      ) {
        _0x223a89 = 127;
      }
      let _0x44ab5c = {
        type: _0x223a89,
        b2b: this.wasBack2Back,
        cmb: this.comboCounter,
      };
      if (this.isPmode(false)) {
        this.gamedata.attack = this.gamedata.linesSent;
        if (this.isPmode(false) === 1) {
          if (this.linesRemaining >= _0x23e2a5) {
            this.linesRemaining -= _0x23e2a5;
          } else {
            this.linesRemaining = 0;
          }
          if (this.ISGAME) {
            this.lrem.textContent = this.linesRemaining;
          }
        } else if (this.isPmode(false) === 3) {
          let _0x3cf805 = this.countGarbageHeight();
          if (this.ISGAME) {
            if (this.cheeseLevel > _0x3cf805) {
              var _0x3b603b = this.cheeseLevel - _0x3cf805;
              this.cheeseLevel = _0x3cf805;
              this.linesRemaining -= _0x3b603b;
              if (
                this.linesRemaining > this.cheeseLevel &&
                this.cheeseLevel < this.minCheeseHeight
              ) {
                this.addGarbage(1);
                this.cheeseLevel += 1;
              }
            }
            this.setLrem(this.linesRemaining);
          } else {
            let _0x4b6da8 = _0x56f5d8 - _0x3cf805;
            this.linesRemaining -= _0x4b6da8;
          }
        } else if (this.isPmode(false) === 7) {
          if (
            this.ISGAME &&
            _0x55b2e1 !== this.Scoring.A.TSPIN_DOUBLE
          ) {
            this.Caption.gameWarning(i18n.notTSD, i18n.notTSDInfo);
            this.practiceModeCompleted();
          }
          if (this.ISGAME) {
            this.lrem.textContent = this.gamedata.TSD;
          }
          if (this.gamedata.TSD === 20) {
            this.gamedata.TSD20 = Math.round(this.clock * 1000);
          }
        } else if (this.ISGAME && this.isPmode(false) === 8) {
          if (_0x223a89 === this.Scoring.A.PERFECT_CLEAR) {
            this.gamedata.lastPC = this.clock;
            this.lrem.textContent = this.gamedata.PCs;
            if (this.ISGAME) {
              this.PCdata = {
                blocks: 0,
                lines: 0,
              };
            }
          } else if (this.ISGAME) {
            this.PCdata.blocks++;
            this.PCdata.lines += _0x23e2a5;
            this.evalPCmodeEnd();
          }
        } else if (this.ISGAME && this.isPmode(false) === 9) {
          let _0x80267d = this.gamedata.lines - _0x23e2a5;
          for (
            let _0x1be21f = 1;
            _0x1be21f <= _0x23e2a5;
            ++_0x1be21f
          ) {
            this.ModeManager.on(
              this.ModeManager.LINE,
              _0x80267d + _0x1be21f,
            );
          }
          this.ModeManager.on(this.ModeManager.LINECLEAR, _0x23e2a5);
          let _0x24a663 = null;
          let _0x587c77 = null;
          if (_0x44c711 > 0) {
            _0x24a663 = this.blockOrSendAttack(_0x44c711, _0x45abcd);
          }
          if (_0x14ac76 > 0) {
            _0x587c77 = this.blockOrSendAttack(_0x14ac76, _0x45abcd);
          }
          if (this.livePmode === 9 && (_0x24a663 || _0x587c77)) {
            this.Live.sendAttack(_0x24a663, _0x587c77, _0x44ab5c);
          }
        }
        if (!this.linesRemaining && this.ISGAME) {
          this.practiceModeCompleted();
        }
      } else if (this.ISGAME) {
        if (this.fourWideFlag && _0x14ac76 && this.Live.noFourWide) {
          for (
            this.Caption.gameWarning(
              i18n.fwDetect,
              i18n.fwDetectInfo,
            );
            _0x14ac76 > 0;
          ) {
            this.addGarbage(1);
            --_0x14ac76;
          }
        }
        let _0x136db4 = null;
        let _0x46518b = null;
        if (_0x44c711 > 0) {
          _0x136db4 = this.blockOrSendAttack(_0x44c711, _0x45abcd);
        }
        if (_0x14ac76 > 0) {
          _0x46518b = this.blockOrSendAttack(_0x14ac76, _0x45abcd);
        }
        if (_0x136db4 || _0x46518b) {
          this.Live.sendAttack(_0x136db4, _0x46518b, _0x44ab5c);
        }
      }
      if (this.ISGAME) {
        if (_0x1ccaaa) {
          this.Items.pickup();
        }
        if (this.R.clearDelay && !this.redrawBlocked) {
          this.play = false;
          this.redrawBlocked = true;
          this.animator = new LineClearAnimator(
            _0x56086c,
            _0x200408,
            this,
          );
        }
      } else {
        this.v.onLinesCleared(_0x44c711, _0x14ac76, _0x44ab5c);
      }
    } else {
      this.comboCounter = -1;
      let _0x2462ea = null;
      if (this.spinPossible) {
        _0x2462ea = this.Scoring.A.TSPIN;
        if (this.debug && this.ISGAME) {
          this.Live.showInChat("", _0x105f70.name + "-Spin");
        }
      } else if (this.spinMiniPossible) {
        _0x2462ea = this.Scoring.A.TSPIN_MINI;
        if (this.debug && this.ISGAME) {
          this.Live.showInChat("", _0x105f70.name + "-Spin Mini");
        }
      }
      if (_0x2462ea && (this.score(_0x2462ea), this.ISGAME)) {
        let _0x306018 = [_0x2462ea, _0x2462ea, false, -1];
        this.playSound(this.SFXset.getClearSFX(..._0x306018), 1);
        if (this.VSEenabled) {
          this.playSound(this.VSFXset.getClearSFX(..._0x306018), 2);
        }
      }
      if (this.ISGAME && this.isPmode(false) === 3) {
        var _0x234511 = this.maxCheeseHeight - this.cheeseLevel;
        if (_0x234511 > 0) {
          var _0x4546b3 = Math.min(
            _0x234511,
            this.linesRemaining - this.cheeseLevel,
          );
          for (_0x4a851d = 0; _0x4a851d < _0x4546b3; _0x4a851d++) {
            this.addGarbage(1);
          }
          this.cheeseLevel += _0x4546b3;
        }
      } else if (this.ISGAME && this.isPmode(false) === 8) {
        this.PCdata.blocks++;
        this.evalPCmodeEnd();
      }
    }
  } else {
    this.comboCounter = -1;
  }
};
GameCore.prototype.countGarbageHeight = function (_0x593ea6) {
  _0x593ea6 = _0x593ea6 || 20;
  var _0x24a3b6 = 0;
  for (var _0x102140 = 0; _0x102140 < _0x593ea6; _0x102140++) {
    if (
      this.matrix[19 - _0x102140][0] !== 8 &&
      this.matrix[19 - _0x102140][1] !== 8
    ) {
      _0x24a3b6 = _0x102140;
      break;
    }
  }
  return _0x24a3b6;
};
GameCore.prototype.is4W = function (_0x1651bc) {
  var _0x1d5497 = 0;
  for (var _0x58ddcd = _0x1651bc; _0x58ddcd >= 0; _0x58ddcd--) {
    var _0x123030 = null;
    var _0x1c10c7 = false;
    for (var _0x145124 = 0; _0x145124 < 10; _0x145124++) {
      if (this.matrix[_0x58ddcd][_0x145124] !== 9) {
        if (this.matrix[_0x58ddcd][_0x145124] === 0) {
          if (_0x1c10c7) {
            _0x123030 = -1;
            _0x1c10c7 = false;
            break;
          }
          if (_0x123030 === null) {
            _0x123030 = 1;
          } else if (++_0x123030 > 4) {
            _0x1c10c7 = false;
            break;
          }
        } else if (_0x123030 === 4) {
          _0x1c10c7 = true;
        } else if (_0x123030) {
          _0x123030 = -1;
          _0x1c10c7 = false;
          break;
        }
      }
    }
    if (_0x123030 === 4 || _0x1c10c7) {
      if (++_0x1d5497 >= 3) {
        return true;
      }
    } else {
      _0x1d5497 = 0;
      if (_0x58ddcd <= 3) {
        return false;
      }
    }
  }
  return false;
};
GameCore.prototype.placeBlock = function (
  _0x4bcc0,
  _0x49dd79,
  _0x1cdf65,
) {
  ++this.placedBlocks;
  if (this.activeBlock.id === 2) {
    this.gamedata.wasted++;
    this.gamedata.tpieces++;
  }
  if (this.GameStats) {
    this.GameStats.get("BLOCKS").set(this.placedBlocks);
  }
  if (this.GameStats) {
    this.GameStats.get("KPP").set(this.getKPP());
  }
  if (this.ISGAME) {
    this.savePlacementTime();
    _0x1cdf65 = _0x1cdf65 || this.timestamp();
  }
  let _0xaf2ada = 0;
  let _0x5c8e87 = 0;
  let _0x4d23ce = false;
  let _0x3d3030 =
    this.blockSets[this.activeBlock.set].blocks[this.activeBlock.id];
  let _0x54aef2 = _0x3d3030.blocks[this.activeBlock.rot].length;
  let _0xf34174 = 0;
  if (this.spinPossible && this.R.allSpin === 1) {
    this.checkAllSpinImmobile();
  }
  for (var _0x4e6756 = 0; _0x4e6756 < _0x54aef2; _0x4e6756++) {
    for (var _0x2de1ed = 0; _0x2de1ed < _0x54aef2; _0x2de1ed++) {
      let _0x3338c6 =
        _0x3d3030.blocks[this.activeBlock.rot][_0x4e6756][_0x2de1ed];
      if (_0x3338c6 > 0) {
        ++_0x5c8e87;
        _0xf34174 = _0x3338c6 === this.activeBlock.item ? 16 : 0;
        if (_0x49dd79 + _0x4e6756 >= 0 && _0x4bcc0 + _0x2de1ed >= 0) {
          this.matrix[_0x49dd79 + _0x4e6756][_0x4bcc0 + _0x2de1ed] =
            _0x3d3030.color ^ _0xf34174;
          if (_0x49dd79 + _0x4e6756 === 19 - this.solidHeight) {
            if (
              this.ISGAME &&
              this.Live.liveMode === 1 &&
              !this.pmode
            ) {
              this.Live.raceCompleted();
              this.place = 1;
              _0x4d23ce = true;
            } else if (!this.ISGAME) {
              this.playing = false;
            }
          }
        } else {
          _0xaf2ada++;
          if (
            _0x49dd79 + _0x4e6756 === -1 &&
            this.deadline[_0x4bcc0 + _0x2de1ed] === 0
          ) {
            this.deadline[_0x4bcc0 + _0x2de1ed] =
              _0x3d3030.color ^ _0xf34174;
          }
        }
      }
    }
  }
  const _0x457521 =
    this.ISGAME &&
    this.ModeManager &&
    this.isPmode(false) === 9 &&
    this.play &&
    this.ModeManager.preventTopout;
  if (_0xaf2ada === _0x5c8e87 && !_0x457521) {
    this.GameOver();
  }
  if (this.play) {
    this.holdUsedAlready = false;
    for (this.checkLineClears(_0x1cdf65); this.solidToAdd; ) {
      this.addSolidGarbage();
      this.solidToAdd--;
    }
    if (this.comboCounter === -1 || this.R.gblock !== 0) {
      this.addGarbageFromQueue(_0x1cdf65);
    }
    this.getNextBlock(_0x1cdf65);
    if (_0x4d23ce) {
      this.GameOver();
    }
  } else if (!this.ISGAME) {
    this.holdUsedAlready = false;
    this.checkLineClears();
    this.getNextBlock();
    this.v.onBlockLocked();
  }
  if (this.gamedata.tpieces > 0 && this.GameStats) {
    this.GameStats.get("WASTE").set(this.getWasted());
  }
};
GameCore.prototype.getQueuePreview = function (_0x4dce5b) {
  let _0x52d037 = [];
  for (var _0xf90dea = 0; _0xf90dea < this.queueLength; _0xf90dea++) {
    _0x52d037.push(this.getRandomizerBlock(_0x4dce5b));
  }
  return _0x52d037;
};
GameCore.prototype.generateQueue = function () {
  if (this.ISGAME) {
    this.queue = [];
  } else {
    this.queue.splice(0, this.queueLength);
  }
  for (var _0x57718c = 0; _0x57718c < this.queueLength; _0x57718c++) {
    this.queue.push(this.getRandomizerBlock());
  }
  if (!this.ISGAME) {
    if (this.pmode === 1) {
      if (this.queue[0].id >= 5 && this.queue[0].set === 0) {
        var _0x3aef1e = this.queue[0];
        if (this.queue[1].id < 5) {
          this.queue[0] = this.queue[1];
          this.queue[1] = _0x3aef1e;
        } else {
          this.queue[0] = this.queue[2];
          this.queue[2] = _0x3aef1e;
        }
      }
    } else if (
      this.r.c.v < 3.3 &&
      this.pmode !== 2 &&
      this.queue.length >= 3 &&
      this.queue[0].id >= 5 &&
      this.queue[1].id >= 5
    ) {
      _0x3aef1e = this.queue[0];
      this.queue[0] = this.queue[2];
      this.queue[2] = _0x3aef1e;
    }
  }
};
GameCore.prototype.addGarbageFromQueue = function (_0x4d5f11) {
  if (this.redBar > 0) {
    var _0x3dee1e;
    var _0x39f1ed = this.incomingGarbage.length;
    var _0x596dd4 = 0;
    var _0x51251b = 0;
    for (
      _0x596dd4 = 0;
      _0x596dd4 < _0x39f1ed &&
      !(
        _0x4d5f11 - this.incomingGarbage[_0x596dd4][1] <=
        this.R.gDelay
      );
      _0x596dd4++
    ) {
      _0x3dee1e = this.addGarbage(this.incomingGarbage[_0x596dd4][0]);
    }
    this.redBar = 0;
    for (
      _0x3dee1e === null && this.recordRedbarChange(_0x4d5f11);
      _0x596dd4 < _0x39f1ed;
    ) {
      this.incomingGarbage[_0x51251b++] =
        this.incomingGarbage[_0x596dd4];
      this.redBar += this.incomingGarbage[_0x596dd4][0];
      _0x596dd4++;
    }
    this.incomingGarbage.length = _0x51251b;
  }
};
GameCore.prototype.addGarbage = function (_0x3abaca) {
  var _0x5118a6 = undefined;
  var _0x106bff = this.isPmode(false);
  if (_0x3abaca <= 0) {
    return 0;
  }
  if (this.R.solidAttack) {
    for (var _0x1c1890 = 0; _0x1c1890 < _0x3abaca; ++_0x1c1890) {
      this.addSolidGarbage();
    }
    _0x5118a6 = null;
  } else {
    this.gamedata.linesReceived += _0x3abaca;
    var _0x5a328e = [8, 8, 8, 8, 8, 8, 8, 8, 8, 8];
    if (_0x106bff === 9 && this.garbageCols.length) {
      _0x5118a6 = this.garbageCols.shift();
    } else if (_0x106bff !== 3 && _0x106bff !== 4) {
      if (this.R.mess >= 0) {
        _0x5118a6 = this.random(0, 9);
      } else {
        var _0x35b1ac = 100 + this.R.mess;
        if (
          !this.lastHolePos ||
          (_0x35b1ac > 0 && this.RNG() < _0x35b1ac / 100)
        ) {
          this.lastHolePos = this.random(0, 9);
        }
        _0x5118a6 = this.lastHolePos;
      }
    } else {
      _0x5118a6 = this.lastHolePos = this.randomExcept(
        0,
        9,
        this.lastHolePos,
      );
    }
    if (this.R.gapW === 1) {
      _0x5a328e[_0x5118a6] = 0;
    } else {
      if (this.R.baseBlockSet === 1) {
        _0x5118a6 -= _0x5118a6 % 2;
      }
      if (_0x5118a6 + this.R.gapW > 10) {
        _0x5118a6 = 10 - this.R.gapW;
      }
      for (let _0xa4f153 = 0; _0xa4f153 < this.R.gapW; ++_0xa4f153) {
        _0x5a328e[_0x5118a6 + _0xa4f153] = 0;
      }
    }
    if (this.R.gInv) {
      for (
        let _0x3c656a = 0;
        _0x3c656a < _0x5a328e.length;
        ++_0x3c656a
      ) {
        _0x5a328e[_0x3c656a] = _0x5a328e[_0x3c656a] === 8 ? 0 : 8;
      }
    }
    if (_0x3abaca <= this.matrix.length) {
      this.deadline = this.matrix[_0x3abaca - 1].slice(0);
    } else {
      this.deadline = _0x5a328e.slice(0);
    }
    var _0x2d9f19;
    var _0x45ddcd = this.matrix.length - this.solidHeight;
    for (var _0x181cc9 = 0; _0x181cc9 < _0x45ddcd; _0x181cc9++) {
      this.matrix[_0x181cc9] =
        _0x45ddcd - _0x181cc9 > _0x3abaca
          ? this.matrix[_0x181cc9 + _0x3abaca].slice(0)
          : _0x5a328e.slice(0);
    }
    this.GameStats.get("RECV").set(this.gamedata.linesReceived);
    if (this.R.gInv || this.R.gapW !== 1) {
      (_0x2d9f19 = new ReplayAction(
        this.Replay.Action.AUX,
        this.timestamp(),
      )).d = [
        this.Replay.AUX.WIDE_GARBAGE_ADD,
        _0x3abaca,
        _0x5118a6,
        this.R.gapW,
        this.R.gInv ? 1 : 0,
      ];
    } else {
      (_0x2d9f19 = new ReplayAction(
        this.Replay.Action.GARBAGE_ADD,
        this.timestamp(),
      )).d = [_0x3abaca, _0x5118a6];
    }
    this.Replay.add(_0x2d9f19);
    this.updateGhostPiece(true);
  }
  return _0x5118a6;
};
GameCore.prototype.addToGarbageQueue = function (_0x467a7d) {
  var _0x53fabf = this.timestamp();
  if (this.R.mess === 0) {
    this.incomingGarbage.push([_0x467a7d, _0x53fabf]);
  } else {
    var _0x486f8d = 0;
    var _0x3afedc = 0;
    var _0x213998 = this.R.mess > 0 ? this.R.mess : 100;
    for (; _0x486f8d < _0x467a7d; ) {
      _0x3afedc++;
      if (_0x213998 === 100 || Math.random() < _0x213998 / 100) {
        this.incomingGarbage.push([_0x3afedc, _0x53fabf]);
        _0x3afedc = 0;
      }
      _0x486f8d++;
    }
    if (_0x3afedc) {
      this.incomingGarbage.push([_0x3afedc, _0x53fabf]);
    }
  }
  this.redBar += _0x467a7d;
  this.recordRedbarChange(_0x53fabf);
  this.v.redrawRedBar(true);
};
GameCore.prototype.getAPM = function () {
  var _0x2c1438 = this.clock;
  if (!this.ISGAME) {
    _0x2c1438 /= 1000;
  }
  var _0x504a59 =
    Math.round((this.gamedata.attack * 100) / (_0x2c1438 / 60)) / 100;
  if (isNaN(_0x504a59) || !isFinite(_0x504a59)) {
    return 0;
  } else {
    return _0x504a59;
  }
};
GameCore.prototype.getKPP = function () {
  var _0x5d032f = 0;
  if (this.placedBlocks) {
    _0x5d032f =
      (this.totalKeyPresses + this.placedBlocks) / this.placedBlocks;
  }
  return Math.round(_0x5d032f * 100) / 100;
};
GameCore.prototype.getVS = function () {
  var _0x349e24 = this.clock;
  if (!this.ISGAME) {
    _0x349e24 /= 1000;
  }
  return (
    Math.round(
      ((this.gamedata.garbageCleared + this.gamedata.attack) *
        10000) /
        _0x349e24,
    ) / 100
  );
};
GameCore.prototype.getWasted = function () {
  return (
    Math.round((this.gamedata.wasted / this.gamedata.tpieces) * 100) /
    100
  );
};
GameCore.prototype.score = function (_0x32e082, _0x4b1173) {
  var _0xb21b76;
  if (_0x4b1173 === undefined) {
    _0x4b1173 = 1;
  }
  _0x4b1173 *= this.R.scoreMult;
  this.gamedata.score += _0xb21b76 = Math.round(
    _0x4b1173 * this.Scoring.get(_0x32e082, this.wasBack2Back),
  );
  if (_0xb21b76 > 0 && this.debug) {
    this.Live.showInChat(
      "",
      Object.keys(this.Scoring.A)[_0x32e082] +
        " * " +
        _0x4b1173 +
        " = <b>" +
        _0xb21b76 +
        "</b>",
    );
  }
  this.GameStats.get("SCORE").set(this.gamedata.score);
  if (this.ISGAME && this.play && !this.gameEnded && this.Replay2) {
    this.Replay2.onScore(_0x32e082, _0x4b1173);
  }
};
GameCore.prototype.timestamp = function () {
  return new Date().getTime();
};
GameCore.prototype.getComboAttack = function (_0x3102d5) {
  if (_0x3102d5 <= 12) {
    return this.comboAttack[_0x3102d5];
  } else {
    return this.comboAttack[this.comboAttack.length - 1];
  }
};
GameCore.prototype.deleteFromGarbageQueue = function (_0x93f1ed) {
  var _0x356742 = this.incomingGarbage.length;
  for (var _0x10f17b = 0; _0x10f17b < _0x356742; _0x10f17b++) {
    if (this.incomingGarbage[_0x10f17b][0] >= _0x93f1ed) {
      this.incomingGarbage[_0x10f17b][0] -= _0x93f1ed;
      break;
    }
    _0x93f1ed -= this.incomingGarbage[_0x10f17b][0];
    this.incomingGarbage[_0x10f17b][0] = 0;
  }
};
GameCore.prototype.blockOrSendAttack = function (
  _0x59d750,
  _0x474298,
) {
  this.gamedata.attack += _0x59d750;
  if (this.redBar > 0 && this.R.gblock < 2) {
    if (this.redBar > _0x59d750) {
      this.redBar -= _0x59d750;
      this.deleteFromGarbageQueue(_0x59d750);
      _0x59d750 = 0;
    } else {
      _0x59d750 -= this.redBar;
      this.redBar = 0;
      this.incomingGarbage = [];
    }
    this.recordRedbarChange(_0x474298);
  }
  if (
    _0x59d750 > 0 &&
    (this.Live.liveMode === 0 ||
      this.Live.liveMode === 2 ||
      this.livePmode === 9)
  ) {
    return _0x59d750;
  } else {
    return null;
  }
};
GameCore.prototype.recordRedbarChange = function (_0x363a07) {
  _0x363a07 = _0x363a07 || this.timestamp();
  var _0x53dd64 = new ReplayAction(
    this.Replay.Action.REDBAR_SET,
    _0x363a07,
  );
  _0x53dd64.d = [this.redBar <= 20 ? this.redBar : 20];
  this.Replay.add(_0x53dd64);
};
GameCore.prototype.paintMatrixWithColor = function (_0x10f7fe) {
  for (var _0x103f1b = 0; _0x103f1b < 20; _0x103f1b++) {
    for (var _0x367ee2 = 0; _0x367ee2 < 10; _0x367ee2++) {
      if (this.matrix[_0x103f1b][_0x367ee2] > 0) {
        this.matrix[_0x103f1b][_0x367ee2] = _0x10f7fe;
      }
    }
  }
};
GameCore.prototype.clearMatrix = function () {
  var _0x3a6a6b = this.matrix.length;
  for (var _0x3099cc = 0; _0x3099cc < _0x3a6a6b; _0x3099cc++) {
    var _0x534240 = this.matrix[_0x3099cc].length;
    for (var _0x5b6b75 = 0; _0x5b6b75 < _0x534240; _0x5b6b75++) {
      this.matrix[_0x3099cc][_0x5b6b75] = 0;
    }
  }
  this.deadline = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
};
GameCore.prototype.updateQueueBox = function () {
  if (this.ISGAME && this.redrawBlocked) {
    return;
  }
  if (
    !this.ISGAME &&
    (this.v.redrawBlocked || !this.v.QueueHoldEnabled)
  ) {
    return;
  }
  this.v.clearQueueCanvas();
  let _0xec8d8e = 0;
  for (
    var _0x3cc712 = 0;
    _0x3cc712 < this.R.showPreviews;
    _0x3cc712++
  ) {
    if (_0x3cc712 >= this.queue.length) {
      if (this.pmode != 9) {
        break;
      }
      if (!this.ModeManager.repeatQueue) {
        break;
      }
      this.ModeManager.addStaticQueueToQueue();
    }
    var _0x466900 = this.queue[_0x3cc712];
    var _0x437398 = this.blockSets[_0x466900.set].previewAs;
    var _0x387a70 = _0x437398.blocks[_0x466900.id].blocks[0];
    var _0x4bf666 = _0x437398.blocks[_0x466900.id].color;
    var _0x11c395 = _0x437398.equidist
      ? [0, 3]
      : _0x437398.blocks[_0x466900.id].yp;
    var _0x3a0c82 = _0x387a70.length;
    var _0x2e705a = _0x437398.blocks[_0x466900.id].xp
      ? _0x437398.blocks[_0x466900.id].xp
      : [0, _0x3a0c82 - 1];
    for (
      var _0x25a2da = _0x11c395[0];
      _0x25a2da <= _0x11c395[1];
      _0x25a2da++
    ) {
      for (
        var _0x22fc9c = _0x2e705a[0];
        _0x22fc9c <= _0x2e705a[1];
        _0x22fc9c++
      ) {
        if (_0x387a70[_0x25a2da][_0x22fc9c] > 0) {
          this.v.drawBlockOnCanvas(
            _0x22fc9c - _0x2e705a[0],
            _0x25a2da - _0x11c395[0] + _0xec8d8e,
            _0x4bf666,
            this.v.QUEUE,
          );
          if (
            _0x466900.item &&
            _0x387a70[_0x25a2da][_0x22fc9c] === _0x466900.item
          ) {
            this.v.drawBrickOverlayOnCanvas(
              _0x22fc9c - _0x2e705a[0],
              _0x25a2da - _0x11c395[0] + _0xec8d8e,
              this.v.QUEUE,
            );
          }
        }
      }
    }
    if (_0x437398.equidist) {
      _0xec8d8e += 3;
    } else {
      _0xec8d8e += _0x11c395[1] - _0x11c395[0] + 2;
    }
  }
  if (this.ISGAME && this.play && !this.gameEnded && this.Replay2) {
    this.Replay2.onQueue(this.clock);
  }
};
GameCore.prototype.redrawHoldBox = function () {
  if (
    (!this.ISGAME || !this.redrawBlocked) &&
    (this.ISGAME ||
      (!this.v.redrawBlocked && this.v.QueueHoldEnabled))
  ) {
    this.v.clearHoldCanvas();
    if (this.blockInHold !== null) {
      var _0x2b5d08 = this.blockSets[this.blockInHold.set].previewAs;
      var _0x333fe5 = _0x2b5d08.blocks[this.blockInHold.id].blocks[0];
      var _0x13d7a0 = _0x2b5d08.blocks[this.blockInHold.id].color;
      var _0x23160d = _0x2b5d08.equidist
        ? [0, 3]
        : _0x2b5d08.blocks[this.blockInHold.id].yp;
      var _0x5e63d7 = _0x333fe5.length;
      var _0xbc1a17 = _0x2b5d08.blocks[this.blockInHold.id].xp
        ? _0x2b5d08.blocks[this.blockInHold.id].xp
        : [0, _0x5e63d7 - 1];
      for (
        var _0x2092b4 = _0x23160d[0];
        _0x2092b4 <= _0x23160d[1];
        _0x2092b4++
      ) {
        for (
          var _0x182ab3 = _0xbc1a17[0];
          _0x182ab3 <= _0xbc1a17[1];
          _0x182ab3++
        ) {
          if (_0x333fe5[_0x2092b4][_0x182ab3] > 0) {
            this.v.drawBlockOnCanvas(
              _0x182ab3 - _0xbc1a17[0],
              _0x2092b4 - _0x23160d[0],
              _0x13d7a0,
              this.v.HOLD,
            );
            if (
              this.blockInHold.item &&
              _0x333fe5[_0x2092b4][_0x182ab3] ===
                this.blockInHold.item
            ) {
              this.v.drawBrickOverlayOnCanvas(
                _0x182ab3 - _0xbc1a17[0],
                _0x2092b4 - _0x23160d[0],
                this.v.HOLD,
              );
            }
          }
        }
      }
    }
    if (this.ISGAME && this.play && !this.gameEnded && this.Replay2) {
      this.Replay2.onHold(this.clock);
    }
  }
};
GameCore.prototype.resetGameData = function () {
  let _0x53ebee = Object.keys(this.gamedata);
  for (let _0x50079d of _0x53ebee) {
    this.gamedata[_0x50079d] = 0;
  }
};
GameCore.prototype.random = function (_0x277121, _0x136867) {
  return Math.round(_0x277121 + this.RNG() * (_0x136867 - _0x277121));
};
GameCore.prototype.randomExcept = function (
  _0xdd590a,
  _0x2ee0aa,
  _0x2bdfa0,
) {
  while (true) {
    var _0x2ebd59 = this.random(_0xdd590a, _0x2ee0aa);
    if (_0x2ebd59 !== _0x2bdfa0) {
      return _0x2ebd59;
    }
  }
};
GameCore.prototype.getGravityLevel = function (_0x5a5fc0) {
  if (_0x5a5fc0 <= 0) {
    return [Number.MAX_SAFE_INTEGER, 0];
  } else if (_0x5a5fc0 <= 18) {
    return [(18 - (_0x5a5fc0 - 1) * 1) / 20, 0];
  } else if (_0x5a5fc0 <= 24) {
    return [(0.9 - (_0x5a5fc0 - 19) * 0.1) / 20, 0];
  } else if (_0x5a5fc0 === 25) {
    return [0.03, 1];
  } else if (_0x5a5fc0 === 26) {
    return [0.02, 1];
  } else if (_0x5a5fc0 === 27) {
    return [0.03333333333333333, 2];
  } else {
    return [0, 20];
  }
};
if (typeof module != "undefined" && module != null) {
  module.exports = GameCore;
}
Bag.prototype.getBlock = function () {
  let _0x4d0b2d = Math.floor(this.RNG() * this.bag.length);
  let _0x2f26e8 = this.bag.splice(_0x4d0b2d, 1)[0];
  if (this.bag.length === 0) {
    this.bag = this.usebag.slice(0);
  }
  return new Block(_0x2f26e8);
};
Classic.prototype.getBlock = function () {
  let _0x52592a = Math.floor(this.RNG() * this.n);
  return new Block(_0x52592a);
};
OneBlock.prototype.getBlock = function () {
  var _0x4b71d7 = this.bag[0];
  if (this.bag.length > 1) {
    _0x4b71d7 = this.bag[this.lastIndex++];
    this.lastIndex %= this.bag.length;
  }
  return new Block(_0x4b71d7);
};
C2Sim.prototype.getRandomExcept = function (_0x3dcdb6) {
  let _0x236bf3 = Math.floor(this.RNG() * (this.n - 1));
  if (_0x3dcdb6 >= 0 && _0x236bf3 >= _0x3dcdb6) {
    ++_0x236bf3;
  }
  if (_0x236bf3 === this.n) {
    _0x236bf3 = 0;
  }
  return _0x236bf3;
};
C2Sim.prototype.getBlock = function () {
  let _0x41c4c1 = 0;
  if (this.hist[0] < 0) {
    _0x41c4c1 = Math.floor(this.RNG() * this.n);
  } else if (this.hist[0] === this.hist[1] || this.hist[1] < 0) {
    _0x41c4c1 =
      this.RNG() <= 0.028105
        ? this.hist[0]
        : this.getRandomExcept(this.hist[0]);
  } else {
    let _0x38e300 = this.RNG();
    if (_0x38e300 <= 0.027055) {
      _0x41c4c1 = this.hist[0];
    } else if (_0x38e300 >= 0.882639) {
      _0x41c4c1 = this.hist[1];
    } else {
      do {
        _0x41c4c1 = this.getRandomExcept(this.hist[0]);
      } while (_0x41c4c1 === this.hist[1]);
    }
  }
  this.hist[1] = this.hist[0];
  this.hist[0] = _0x41c4c1;
  return new Block(_0x41c4c1);
};
Repeated.prototype.nextSegment = function (_0x134e38) {
  this.block = this.randomizer.getBlock();
  this.i = 1 + Math.floor(this.randomizer.RNG() * this.n);
};
Repeated.prototype.getBlock = function (_0x3cd020) {
  if (this.i === 0) {
    this.nextSegment();
  }
  this.i--;
  return this.block;
};
BsBlock.prototype.getBlock = function () {
  let _0x44310d = this.randomizer.getBlock();
  this.i++;
  if (this.i >= 21 && this.randomizer.RNG() < 0.1) {
    _0x44310d.set =
      this.bsArr[
        Math.floor(this.randomizer.RNG() * this.bsArr.length)
      ];
    this.i = 0;
    if (_0x44310d.set === 2) {
      _0x44310d.id = Math.floor(this.randomizer.RNG() * 7);
    }
    if (_0x44310d.set === 4) {
      _0x44310d.id = Math.floor(this.randomizer.RNG() * 18);
    }
  }
  return _0x44310d;
};
BigBlockRand.prototype.getBlock = function () {
  let _0x208771 = this.randomizer.getBlock();
  this.i++;
  if (this.randomizer.RNG() < this.i / this.EXPECTED_BLOCKS) {
    _0x208771.set = 2;
    _0x208771.id = Math.floor(this.randomizer.RNG() * 7);
  }
  return _0x208771;
};
ConstBlock.prototype.getBlock = function () {
  let _0x44f012 = new Block(this.id);
  _0x44f012.set = this.set === 0 ? -1 : this.set;
  return _0x44f012;
};
Live.prototype.adjustForCustomLayout = function () {
  if (this.getParameterByName("vt") === "s") {
    document.getElementById("lobby").style.display = "none";
    document.getElementsByClassName("navbar")[0].style.display =
      "none";
  }
  if (this.getParameterByName("ce") === "0") {
    document.getElementById("chatInputArea").style.display = "none";
    document.getElementsByClassName("chatArea")[0].style.display =
      "none";
  }
};
Live.prototype.toggleLobbby = function (_0x333844) {
  if (typeof _0x333844 == "boolean") {
    this.lobbyVisible = !_0x333844;
  }
  if (this.lobbyVisible) {
    this.lobbyBox.style.display = "none";
    this.lobbyVisible = false;
    this.p.focusState = 0;
    this.RoomInfo.onLobbyClosed();
  } else {
    let _0x20256c =
      this.clients[this.cid] && this.clients[this.cid].mod;
    this.editRoomButton.style.display =
      this.iAmHost || _0x20256c ? null : "none";
    this.editRoomButton.classList.add("editBtn");
    if (_0x20256c) {
      if (this.iAmHost) {
        if (this.editRoomButton.classList.contains("modEditBtn")) {
          this.editRoomButton.classList.remove("modEditBtn");
          this.editRoomButton.childNodes[1].nodeValue = " Edit";
        }
      } else {
        this.editRoomButton.classList.add("modEditBtn");
        this.editRoomButton.childNodes[1].nodeValue = " ModEdit";
      }
    }
    this.lobbyBox.style.display = "block";
    this.lobbyVisible = true;
    this.refreshLobbby();
    this.p.focusState = 1;
  }
};
Live.prototype.initEmoteSelect = function (_0x15c1c5) {
  showElem(document.querySelector("svg.emSel"));
  this.chatInput.style.paddingRight = "21px";
  this.EmoteSelect = new EmoteSelect(
    this.chatInput,
    _0x15c1c5,
    this.chatArea,
    document.querySelector("svg.emSel"),
    "/res/oe/",
    {
      Jstris: "/res/img/e/jstris.png",
      "smileys-emotion": "grinning_face",
      "people-body": "waving_hand",
      "animals-nature": "monkey_face",
      "food-drink": "red_apple",
      "travel-places": "compass",
      activities: "joystick",
      objects: "light_bulb",
      symbols: "warning",
      flags: "flag_isle_of_man",
      "extras-openmoji": "hacker_cat",
      "extras-unicode": "first_aid",
      "user-emotes": "/res/img/e/u/Pepega.png",
    },
  );
};
Live.prototype.toggleMore = function () {
  if (this.moreVisible) {
    this.moreResults.style.display = "none";
    this.moreVisible = false;
    this.p.focusState = 0;
  } else {
    this.safeSend('{"t":15}');
    this.moreResults.style.display = "block";
    this.moreVisible = true;
    this.p.focusState = 1;
  }
};
Live.prototype.refreshLobbby = function () {
  this.safeSend('{"t":10}');
  this.refreshLobbyButton.disabled = true;
  setTimeout(
    function () {
      this.refreshLobbyButton.disabled = false;
    }.bind(this),
    2000,
  );
};
Live.prototype.saveRD = function () {
  var _0x25f414;
  var _0x284c45;
  var _0x16c249;
  var _0x4a5101 = {};
  var _0x5a8337 = {
    comboTable: {
      d: ",",
      t: "i",
    },
    attackTable: {
      d: ",",
      t: "i",
    },
    lockDelay: {
      d: "/",
      t: "i",
    },
    sgProfile: {
      d: ",",
      t: "f",
    },
  };
  _0x25f414 = document.getElementById("moreSet2");
  var _0x2575cc = Array.prototype.slice.call(
    _0x25f414.getElementsByTagName("input"),
    0,
  );
  var _0x3ac454 = Array.prototype.slice.call(
    _0x25f414.getElementsByTagName("select"),
    0,
  );
  _0x284c45 = _0x2575cc.concat(_0x3ac454);
  for (_0x16c249 = 0; _0x16c249 < _0x284c45.length; ++_0x16c249) {
    if (
      _0x284c45[_0x16c249].id !== "attackMode" &&
      _0x284c45[_0x16c249].type !== "radio" &&
      _0x284c45[_0x16c249].type !== "hidden"
    ) {
      if (_0x284c45[_0x16c249].type === "checkbox") {
        _0x4a5101[_0x284c45[_0x16c249].id] =
          _0x284c45[_0x16c249].checked;
      } else {
        var _0x1c62a8 = _0x284c45[_0x16c249].value;
        var _0x3a1159 = /^\d+$/.test(_0x1c62a8);
        _0x4a5101[_0x284c45[_0x16c249].id] = _0x3a1159
          ? parseInt(_0x1c62a8)
          : _0x1c62a8;
        if (_0x284c45[_0x16c249].id in _0x5a8337) {
          let _0x3091fa = _0x5a8337[_0x284c45[_0x16c249].id].d;
          let _0x3365bc = _0x5a8337[_0x284c45[_0x16c249].id].t;
          var _0x2cb647 = _0x1c62a8.split(_0x3091fa);
          var _0xe41349 = null;
          if (_0x3365bc === "i") {
            _0xe41349 = _0x2cb647.map(function (_0x4b75db) {
              return parseInt(_0x4b75db);
            });
          } else if (_0x3365bc === "f") {
            _0xe41349 = _0x2cb647.map(function (_0x5ec3a9) {
              return parseFloat(_0x5ec3a9);
            });
          }
          _0x4a5101[_0x284c45[_0x16c249].id] = _0xe41349;
        }
      }
    }
  }
  var _0x26d476 = parseInt(
    document.querySelector('input[name="allSpin"]:checked').value,
  );
  if (_0x26d476) {
    _0x4a5101.allSpin = _0x26d476;
  }
  var _0x2d7cb1 = parseInt(
    document.querySelector('input[name="roGho"]:checked').value,
  );
  if (_0x2d7cb1) {
    _0x4a5101.ghost = _0x2d7cb1;
  }
  delete _0x4a5101.hostStart;
  delete _0x4a5101.srvSel;
  if (_0x4a5101.hasOwnProperty("rDAS")) {
    _0x4a5101.DAS = parseInt(_0x4a5101.rDAS);
    delete _0x4a5101.rDAS;
  }
  if (_0x4a5101.hasOwnProperty("rARR")) {
    _0x4a5101.ARR = parseInt(_0x4a5101.rARR);
    delete _0x4a5101.rARR;
  }
  document.getElementById("saveData").style.display = "block";
  document.getElementById("saveDataArea").value =
    JSON.stringify(_0x4a5101);
  if (typeof ga == "function") {
    ga("send", {
      hitType: "event",
      eventCategory: "Preset",
      eventAction: "export",
    });
  }
};
Live.prototype.switchRDmode = function (_0x184cb1) {
  var _0x11ed85 = document.getElementsByName("moreSel");
  for (var _0x192dfd = 0; _0x192dfd < _0x11ed85.length; _0x192dfd++) {
    if (_0x11ed85[_0x192dfd].value === _0x184cb1.toString()) {
      _0x11ed85[_0x192dfd].checked = true;
    }
  }
  document.getElementById("moreSet2").style.display = "block";
  document.getElementById("presetMode").style.display = "none";
  document.getElementById("saveRD").style.visibility = "visible";
  this.createRoomDialog.style.height = null;
  if (_0x184cb1 === 0) {
    this.showClass("adv", false);
    this.showClass("simple", true);
  } else if (_0x184cb1 === 1) {
    this.showClass("simple", false);
    this.showClass("adv", true);
    this.createRoomDialog.style.height = "660px";
  } else if (_0x184cb1 === 2) {
    document.getElementById("moreSet2").style.display = "none";
    document.getElementById("presetMode").style.display = "block";
    document.getElementById("saveRD").style.visibility = "hidden";
    this.createRoomDialog.style.height = "493px";
  }
};
Live.prototype.onPresetChange = function () {
  var _0x41b0c9 = document.getElementById("presetSel");
  document.getElementById("settingsDesc").textContent =
    _0x41b0c9.options[_0x41b0c9.selectedIndex].dataset.desc;
};
Live.prototype.useCustomPreset = function () {
  var _0xe103a0 = prompt("Enter title or ID");
  if (_0xe103a0 !== null) {
    var _0x447ee5 = new XMLHttpRequest();
    var _0x5d6a04 = this;
    _0x447ee5.addEventListener("load", function () {
      var _0x544b7d = JSON.parse(this.responseText);
      var _0x331d4f = document.getElementById("presetSel");
      addOption(_0x331d4f, _0x544b7d);
      _0x331d4f.value = _0x544b7d.id;
      _0x5d6a04.onPresetChange();
    });
    _0x447ee5.open("GET", "/code/getPresetData/" + _0xe103a0);
    _0x447ee5.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    _0x447ee5.send();
  }
};
Live.prototype.showRoomDialogForEdit = function () {
  this.showRoomDialog();
  this.switchRDmode(1);
  let _0x6d6e9f = this.roomConfig;
  let _0x8439f8 = document.getElementById("create");
  var _0x4c20d7;
  var _0x57eea9;
  _0x8439f8.classList.add("editBtn");
  _0x8439f8.childNodes[1].nodeValue = " " + i18n.applyCh;
  document.getElementById("gameMode").disabled = true;
  document.getElementById("srvSel").disabled = true;
  hideElem(document.getElementById("addJL"));
  _0x4c20d7 = this.roomConfig.n;
  (_0x57eea9 = document.createElement("textarea")).innerHTML =
    _0x4c20d7;
  this.roomNameInput.value = _0x57eea9.value;
  this.isPrivateInput.checked = this.roomConfig.p;
  document.getElementById("numPlayers").value =
    _0x6d6e9f.max >= 1 && _0x6d6e9f.max <= 7 ? _0x6d6e9f.max : 28;
  document.getElementById("gameMode").value = _0x6d6e9f.pmode
    ? _0x6d6e9f.pmode[0] + 100
    : _0x6d6e9f.mode;
  document.getElementById("attackTable").value =
    this.roomConfig.at.join(",");
  document.getElementById("comboTable").value =
    this.roomConfig.ct.join(",");
  document.getElementById("sgProfile").value =
    this.roomConfig.sgpA.join(",");
  document.getElementById("gdmSel").value = _0x6d6e9f.gdm;
  document.getElementById("gblockSel").value = _0x6d6e9f.gblock;
  document.getElementById("rndSel").value = _0x6d6e9f.rnd;
  document.getElementById("blocksSel").value = _0x6d6e9f.bbs;
  document.getElementById("prSel").value = _0x6d6e9f.pr;
  document.getElementById("garbageDelay").value = _0x6d6e9f.gDelay;
  document.getElementById("mess").value = _0x6d6e9f.mess;
  document.getElementById("gapW").value = _0x6d6e9f.gapW;
  document.getElementById("gInv").checked = _0x6d6e9f.gInv;
  document.getElementById("hasSolid").checked = _0x6d6e9f.sg !== 0;
  document.getElementById("solid").value = _0x6d6e9f.sg;
  document.getElementById("hasHold").checked = _0x6d6e9f.hold;
  document.getElementById("hostStart").checked = _0x6d6e9f.hostStart;
  document.getElementById("noFW").checked = _0x6d6e9f.noFW;
  document.getElementById("solidAtk").checked = _0x6d6e9f.sa;
  document.getElementById("as" + _0x6d6e9f.as).checked = true;
  document.getElementById("rg" + _0x6d6e9f.ghost).checked = true;
  document.getElementById("rDAS").value = _0x6d6e9f.DAS;
  document.getElementById("rARR").value = _0x6d6e9f.ARR;
  document.getElementById("asEx").value = _0x6d6e9f.asEx;
  document.getElementById("clearDelay").value = _0x6d6e9f.cd;
  document.getElementById("speedLimit").value = _0x6d6e9f.sl;
  document.getElementById("gravityLvl").value = _0x6d6e9f.grav;
  document.getElementById("lockDelay").value = _0x6d6e9f.ld.join("/");
  document.getElementById("srvSel").value = this.serverId;
};
Live.prototype.showRoomDialog = function () {
  this.clearRoomForm();
  this.createRoomDialog.style.display = "block";
  let _0x3ab966 = document.getElementById("create");
  _0x3ab966.classList.remove("editBtn");
  _0x3ab966.childNodes[1].nodeValue = " " + i18n.create;
  document.getElementById("gameMode").disabled = false;
  document.getElementById("srvSel").disabled = false;
  document.getElementById("addJL").style.display = "inline";
  var _0x3806b3 = new XMLHttpRequest();
  var _0x4eb10c = document.getElementById("presetSel");
  _0x4eb10c.innerHTML =
    '<option value="0" data-desc="The default settings">Default</option>';
  _0x4eb10c.value = "0";
  this.onPresetChange();
  _0x3806b3.addEventListener("load", function () {
    var _0x4f8ab4 = JSON.parse(this.responseText);
    for (
      var _0x32dead = 0;
      _0x32dead < _0x4f8ab4.length;
      _0x32dead++
    ) {
      addOption(_0x4eb10c, _0x4f8ab4[_0x32dead]);
    }
    document.getElementById("presetLoadState").style.visibility =
      "hidden";
  });
  _0x3806b3.open("GET", "/code/presetList");
  _0x3806b3.setRequestHeader("X-Requested-With", "XMLHttpRequest");
  _0x3806b3.send();
  document.getElementById("presetLoadState").style.visibility =
    "visible";
};
Live.prototype.closeRoomDialog = function () {
  this.createRoomDialog.style.display = "none";
  this.clearRoomForm();
};
Live.prototype.clearRoomForm = function () {
  this.switchRDmode(2);
  this.roomNameInput.value =
    (this.chatName !== "" ? this.chatName : "NoNamed") + "'s room";
  this.isPrivateInput.checked = false;
  document.getElementById("createState").style.display = "none";
  document.getElementById("create").disabled = false;
  document.getElementById("saveData").style.display = "none";
  document.getElementById("numPlayers").value = 28;
  document.getElementById("gameMode").value = 0;
  document.getElementById("isPrivate").checked = false;
  document.getElementById("hasSolid").checked = true;
  document.getElementById("solid").value = 120;
  this.setDefaultRule();
  this.clearLimitsForm();
};
Live.prototype.clearLimitsForm = function () {
  let _0x2df61e = document.getElementById("joinLimits");
  let _0x202d0a = Array.from(_0x2df61e.getElementsByTagName("input"));
  let _0x196085 = 0;
  for (let _0x441a7f of _0x202d0a) {
    _0x441a7f.min = "0";
    _0x441a7f.step = ".1";
    _0x441a7f.autocomplete = "off";
    _0x441a7f.placeholder = _0x196085 % 2 == 0 ? "MIN" : "MAX";
    _0x441a7f.value = "";
    ++_0x196085;
  }
};
Live.prototype.getFilledLimits = function () {
  let _0x3dccc0 = document.getElementById("joinLimits");
  let _0x21fa1d = Array.from(_0x3dccc0.getElementsByTagName("input"));
  let _0x332ddf = -1;
  let _0x4467ae = 0;
  let _0x7c956 = [];
  for (let _0x285f68 of _0x21fa1d) {
    ++_0x332ddf;
    if (_0x285f68.value === "") {
      _0x7c956.push(null);
      ++_0x4467ae;
      continue;
    }
    let _0x502614 = parseFloat(_0x285f68.value);
    if (isNaN(_0x502614)) {
      return false;
    }
    _0x7c956.push(_0x502614);
    if (
      _0x332ddf % 2 == 1 &&
      _0x7c956[_0x332ddf - 1] !== null &&
      _0x502614 <= _0x7c956[_0x332ddf - 1]
    ) {
      return false;
    }
  }
  if (_0x4467ae === _0x7c956.length) {
    return null;
  } else {
    return _0x7c956;
  }
};
Live.prototype.setDefaultRule = function () {
  document.getElementById("attackMode").value = 0;
  this.attackSelect();
  document.getElementById("solid").disabled =
    !document.getElementById("hasSolid").checked;
  document.getElementById("hasHold").checked = true;
  document.getElementById("solid").value = 120;
  document.getElementById("clearDelay").value = 0;
  document.getElementById("speedLimit").value = 0;
  document.getElementById("rndSel").value = "0";
  document.getElementById("blocksSel").value = "0";
  document.getElementById("gravityLvl").value = "1";
  document.getElementById("lockDelay").value = "500/5000/20000";
  document.getElementById("sgProfile").value = "0,3";
  document.getElementById("prSel").value = "5";
  document.getElementById("gdmSel").value = "3";
  document.getElementById("gblockSel").value = "0";
  document.getElementById("garbageDelay").value = "500";
  document.getElementById("mess").value = "0";
  document.getElementById("gapW").value = "1";
  document.getElementById("gInv").checked = false;
  document.getElementById("hostStart").checked = false;
  document.getElementById("noFW").checked = false;
  document.getElementById("solidAtk").checked = false;
  document.getElementById("as0").checked = true;
  document.getElementById("rg-1").checked = true;
  document.getElementById("rDAS").value = -1;
  document.getElementById("rARR").value = -1;
  document.getElementById("asEx").value = "";
  document.getElementById("srvSel").value = "0";
};
Live.prototype.attackSelect = function () {
  var _0x493aa2 = "";
  var _0x3f9b4c = "";
  switch (parseInt(document.getElementById("attackMode").value)) {
    case 0:
      _0x493aa2 = "0,0,1,2,4,4,6,2,0,10,1";
      _0x3f9b4c = "0,0,1,1,1,2,2,3,3,4,4,4,5";
      break;
    case 1:
      _0x493aa2 = "0,0,1,2,4,4,6,2,1,9,1";
      _0x3f9b4c = "0,0,1,1,2,2,3,3,4,4,4,5,5";
      break;
    case 2:
      _0x493aa2 = "0,0,1,2,4,1,2,0,0,10,1";
      _0x3f9b4c = "0,0,1,1,1,2,2,3,3,4,4,4,5";
  }
  document.getElementById("attackTable").value = _0x493aa2;
  document.getElementById("comboTable").value = _0x3f9b4c;
};
Live.prototype.applyPreset = function (_0x45c5a2) {
  for (var _0x200a36 in _0x45c5a2) {
    switch (_0x200a36) {
      case "attackTable":
        document.getElementById("attackTable").value =
          _0x45c5a2[_0x200a36].join(",");
        break;
      case "comboTable":
        document.getElementById("comboTable").value =
          _0x45c5a2[_0x200a36].join(",");
        break;
      case "sgProfile":
        document.getElementById("sgProfile").value =
          _0x45c5a2[_0x200a36].join(",");
        break;
      case "lockDelay":
        document.getElementById("lockDelay").value =
          _0x45c5a2[_0x200a36].join("/");
        break;
      case "hasSolid":
        document.getElementById("hasSolid").checked =
          _0x45c5a2[_0x200a36];
        break;
      case "hasHold":
        document.getElementById("hasHold").checked =
          _0x45c5a2[_0x200a36];
        break;
      case "isPrivate":
        document.getElementById("isPrivate").checked =
          _0x45c5a2[_0x200a36];
        break;
      case "allSpin":
        document.getElementById("as" + _0x45c5a2[_0x200a36]).checked =
          true;
        break;
      case "DAS":
        document.getElementById("rDAS").value = _0x45c5a2[_0x200a36];
        break;
      case "ARR":
        document.getElementById("rARR").value = _0x45c5a2[_0x200a36];
        break;
      case "ghost":
        document.getElementById("rg" + _0x45c5a2[_0x200a36]).checked =
          true;
        break;
      default:
        document.getElementById(_0x200a36).value =
          _0x45c5a2[_0x200a36];
    }
  }
};
Live.prototype.makeRoomWrapper = function () {
  var _0x35d910 = document
    .getElementById("create")
    .classList.contains("editBtn");
  if (document.getElementById("more_preset").checked) {
    var _0x442df5 = document.getElementById("presetSel").value;
    if (_0x442df5 != "0") {
      document.getElementById("createState").style.display = "inline";
      document.getElementById("create").disabled = true;
      var _0xd765a3 = new XMLHttpRequest();
      var _0x335c5e = this;
      _0xd765a3.addEventListener("load", function () {
        var _0x8ff03c = JSON.parse(this.responseText);
        _0x335c5e.setDefaultRule();
        _0x335c5e.applyPreset(_0x8ff03c.data);
        _0x335c5e.makeRoom(_0x35d910);
      });
      _0xd765a3.open("GET", "/code/getPresetData/" + _0x442df5);
      _0xd765a3.setRequestHeader(
        "X-Requested-With",
        "XMLHttpRequest",
      );
      _0xd765a3.send();
      if (typeof ga == "function") {
        ga("send", {
          hitType: "event",
          eventCategory: "Preset",
          eventAction: "load",
        });
      }
      return;
    }
  }
  this.makeRoom(_0x35d910);
};
Live.prototype.makeRoom = function (_0x30133c) {
  var _0x15e655 = true;
  var _0x2e7d42 = "";
  var _0x267562 = this.roomNameInput.value.replace(/"/g, '\\"');
  var _0x4653dd = new Object();
  _0x4653dd.t = 11;
  if (_0x30133c) {
    _0x4653dd.edit = _0x30133c;
  }
  if (document.getElementById("more_simple").checked) {
    this.attackSelect();
  }
  if (_0x267562.length === 0) {
    _0x2e7d42 += i18n.rNameReq + "\n";
    _0x15e655 = false;
  }
  _0x4653dd.p = this.isPrivateInput.checked;
  _0x4653dd.n = _0x267562;
  var _0x4ce26f;
  var _0x172296;
  var _0x1cb589 = document.getElementById("numPlayers");
  _0x4653dd.pl = parseInt(
    _0x1cb589.options[_0x1cb589.selectedIndex].value,
  );
  _0x1cb589 = document.getElementById("gameMode");
  _0x4653dd.m = parseInt(
    _0x1cb589.options[_0x1cb589.selectedIndex].value,
  );
  if (_0x4653dd.m > 100) {
    _0x4653dd.pm = _0x4653dd.m - 100;
    _0x4653dd.m = 3;
  }
  var _0x27c331 =
    "[" + document.getElementById("attackTable").value + "]";
  var _0x5ad44f =
    "[" + document.getElementById("comboTable").value + "]";
  try {
    _0x4ce26f = JSON.parse(_0x27c331);
    _0x172296 = JSON.parse(_0x5ad44f);
    function _0x565c20(_0x16ec93) {
      return (
        Number(_0x16ec93) === _0x16ec93 &&
        _0x16ec93 % 1 == 0 &&
        _0x16ec93 >= 0 &&
        _0x16ec93 <= 255
      );
    }
    if (
      _0x4ce26f.length !== 11 ||
      _0x172296.length !== 13 ||
      !_0x4ce26f.every(_0x565c20) ||
      !_0x172296.every(_0x565c20)
    ) {
      throw 1;
    }
  } catch (_0x325dcc) {
    _0x2e7d42 += "Attack table or combo table has invalid format.\n";
    _0x15e655 = false;
  }
  _0x4653dd.at = _0x4ce26f;
  _0x4653dd.ct = _0x172296;
  _0x4653dd.gdm = parseInt(document.getElementById("gdmSel").value);
  _0x4653dd.gblock = parseInt(
    document.getElementById("gblockSel").value,
  );
  _0x4653dd.rnd = parseInt(document.getElementById("rndSel").value);
  _0x4653dd.bset = parseInt(
    document.getElementById("blocksSel").value,
  );
  _0x4653dd.pr = parseInt(document.getElementById("prSel").value);
  _0x4653dd.gDelay = parseInt(
    document.getElementById("garbageDelay").value,
  );
  _0x4653dd.mess = parseInt(document.getElementById("mess").value);
  _0x4653dd.gapW = parseInt(document.getElementById("gapW").value);
  if (
    isNaN(_0x4653dd.gDelay) ||
    isNaN(_0x4653dd.mess) ||
    isNaN(_0x4653dd.gapW)
  ) {
    _0x2e7d42 += "gDelay, mess, gapW must be numeric values.\n";
    _0x15e655 = false;
  }
  var _0x3813ec = document.getElementById("asEx").value;
  if (_0x3813ec.length) {
    try {
      _0x3813ec = _0x3813ec.toUpperCase().split(",");
      _0x565c20 = function (_0xe18a3e) {
        return (
          _0xe18a3e.length > 0 &&
          _0xe18a3e.length <= 2 &&
          /^[A-Z0-9]+$/.test(_0xe18a3e)
        );
      };
      if (_0x3813ec.length > 6 || !_0x3813ec.every(_0x565c20)) {
        throw 1;
      }
      _0x4653dd.asEx = _0x3813ec.join(",");
    } catch (_0x219d98) {
      _0x2e7d42 +=
        "Allspin piece exclusion list invalid. Enter e.g.: L,S,Z,J. Max 6 items.\n";
      _0x15e655 = false;
    }
  }
  if (document.getElementById("hasSolid").checked) {
    var _0x57a75c = parseInt(document.getElementById("solid").value);
    if (!_0x57a75c || _0x57a75c < 0 || _0x57a75c > 600) {
      _0x2e7d42 += "Time interval is invalid.\n";
      _0x15e655 = false;
    } else {
      _0x4653dd.sg = _0x57a75c;
    }
  } else {
    _0x4653dd.sg = 0;
  }
  _0x4653dd.hold = document.getElementById("hasHold").checked;
  _0x4653dd.hostStart = document.getElementById("hostStart").checked;
  _0x4653dd.noFW = document.getElementById("noFW").checked;
  _0x4653dd.sa = document.getElementById("solidAtk").checked;
  _0x4653dd.gInv = document.getElementById("gInv").checked;
  _0x4653dd.as = parseInt(
    document.querySelector('input[name="allSpin"]:checked').value,
  );
  _0x4653dd.ghost = parseInt(
    document.querySelector('input[name="roGho"]:checked').value,
  );
  _0x4653dd.srv = document.getElementById("srvSel").value;
  if (
    _0x4653dd.srv !== "0" &&
    _0x4653dd.srv.charAt(0) !== "M" &&
    !_0x4653dd.p
  ) {
    _0x2e7d42 +=
      "Server selection is currently available only for Private rooms.\n";
    _0x15e655 = false;
  }
  var _0x5ba88f = parseInt(
    document.getElementById("clearDelay").value,
  );
  if (isNaN(_0x5ba88f) || _0x5ba88f < 0 || _0x5ba88f > 6000) {
    _0x2e7d42 += "Clear delay is invalid.\n";
    _0x15e655 = false;
  } else {
    _0x4653dd.cd = _0x5ba88f;
  }
  var _0x22d831 = parseInt(document.getElementById("rDAS").value);
  if (isNaN(_0x22d831) || _0x22d831 < -1 || _0x22d831 > 5000) {
    _0x2e7d42 += "DAS is invalid.\n";
    _0x15e655 = false;
  } else {
    _0x4653dd.DAS = _0x22d831;
  }
  var _0x2ae37b = parseInt(document.getElementById("rARR").value);
  if (isNaN(_0x2ae37b) || _0x2ae37b < -1 || _0x2ae37b > 5000) {
    _0x2e7d42 += "ARR is invalid.\n";
    _0x15e655 = false;
  } else {
    _0x4653dd.ARR = _0x2ae37b;
  }
  var _0x4211ad = parseFloat(
    document.getElementById("speedLimit").value,
  );
  if (isNaN(_0x4211ad) || _0x4211ad < 0 || _0x4211ad > 10) {
    _0x2e7d42 += "Speed limit is invalid. Allowed (0-10PPS).\n";
    _0x15e655 = false;
  } else {
    _0x4653dd.sl = _0x4211ad;
  }
  var _0x988bb5 = parseInt(
    document.getElementById("gravityLvl").value,
  );
  if (isNaN(_0x988bb5) || _0x988bb5 < 0 || _0x988bb5 > 28) {
    _0x2e7d42 += "Gravity LVL must be 0-28.\n";
    _0x15e655 = false;
  } else {
    _0x4653dd.grav = _0x988bb5;
  }
  var _0x28e4ef = document
    .getElementById("lockDelay")
    .value.split("/", 3)
    .map(function (_0x46818d) {
      return parseInt(_0x46818d, 10);
    });
  if (
    _0x28e4ef.length !== 3 ||
    isNaN(_0x28e4ef[0]) ||
    isNaN(_0x28e4ef[1]) ||
    isNaN(_0x28e4ef[2]) ||
    _0x28e4ef[0] < 0 ||
    _0x28e4ef[1] < 0 ||
    _0x28e4ef[2] < 0 ||
    _0x28e4ef[0] > 20000000 ||
    _0x28e4ef[1] > 20000000 ||
    _0x28e4ef[2] > 20000000
  ) {
    _0x2e7d42 +=
      "Lock delay value is invalid. Expected format: 500/5000/20000.\n";
    _0x15e655 = false;
  } else {
    _0x4653dd.ld = _0x28e4ef;
  }
  var _0x4ec463 =
    "[" + document.getElementById("sgProfile").value + "]";
  try {
    _0x4ec463 = JSON.parse(_0x4ec463);
    _0x565c20 = function (_0x40a6dc) {
      return (
        Number(_0x40a6dc) === _0x40a6dc &&
        _0x40a6dc >= 0 &&
        _0x40a6dc <= 999
      );
    };
    if (
      _0x4ec463.length < 1 ||
      _0x4ec463.length > 30 ||
      !_0x4ec463.every(_0x565c20)
    ) {
      throw 1;
    }
    if (_0x4ec463[_0x4ec463.length - 1] <= 0) {
      _0x2e7d42 += "Last sgProfile delay must be > 0.\n";
      throw 1;
    }
  } catch (_0x5ecd8a) {
    _0x2e7d42 += "Solid garbage profile has invalid format.\n";
    _0x15e655 = false;
  }
  _0x4653dd.sgpA = _0x4ec463;
  var _0xf61fd4 = this.getFilledLimits();
  if (_0xf61fd4 === false) {
    _0x2e7d42 +=
      "All join limits must be numeric and MIN must be less than MAX.\n";
    _0x15e655 = false;
  } else if (_0xf61fd4 !== null) {
    _0x4653dd.lim = _0xf61fd4;
  }
  if (document.getElementById("r-ext").value != 0) {
    _0x4653dd.ext = parseInt(document.getElementById("r-ext").value);
  }
  if (_0x15e655) {
    var _0x3e25f5 = JSON.stringify(_0x4653dd);
    this.safeSend(_0x3e25f5);
    this.sendGameOverEvent();
    this.closeRoomDialog();
    this.toggleLobbby(false);
    this.createRoomRequest = _0x4653dd;
  } else {
    alert(_0x2e7d42);
  }
  document.getElementById("createState").style.display = "none";
  document.getElementById("create").disabled = false;
};
Live.prototype.joinRoom = function (_0x207ea3) {
  this.sendGameOverEvent();
  var _0x41e577 = _0x207ea3.replace(/"/g, '\\"');
  var _0x296c5f = '{"t":12, "id":"' + _0x41e577 + '"}';
  this.safeSend(_0x296c5f);
  this.closeRoomDialog();
  this.toggleLobbby(false);
  this.hideResults();
  if (_0x41e577 == 5 && typeof ga == "function") {
    ga("send", {
      hitType: "event",
      eventCategory: "Team",
      eventAction: "joinTeamRoom",
    });
  }
};
Live.prototype.onOpen = function (_0x454962) {
  this.wasConnected = true;
  if (this.connectionTimeout) {
    clearTimeout(this.connectionTimeout);
    this.connectionTimeout = null;
  }
  this.p.Caption.hide(this.p.Caption.LOADING);
  this.socket.onclose = this.onClose.bind(this);
  if (this.authorized && !this.joinRemote) {
    this.authReady = false;
    this.p.Caption.loading(i18n.signingIn);
    var _0x5ea730 = new XMLHttpRequest();
    var _0xedd248 = this;
    _0x5ea730.onreadystatechange = function () {
      if (this.readyState === 4 && this.status === 200) {
        var _0x48b42b = JSON.parse(this.responseText);
        _0xedd248.authorize(_0x48b42b);
      }
    };
    _0x5ea730.open("GET", "/token", true);
    _0x5ea730.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    _0x5ea730.send();
  }
};
Live.prototype.authorize = function (_0x2b4699) {
  if (_0x2b4699.hasOwnProperty("token")) {
    _0x2b4699.t = 19;
    _0x2b4699.s = this.sessX;
    this.safeSend(JSON.stringify(_0x2b4699));
  }
};
Live.prototype.getAuthorizedNameLink = function (
  _0x5b384f,
  _0xac8d01,
  _0x18f02c,
) {
  var _0x5ac0b5 = _0x5b384f;
  var _0x29650a = "";
  var _0x1a01e5 = "";
  var _0x6cdeb5 = null;
  var _0x55bccb = "";
  var _0x2f55f1 = [];
  if (_0x18f02c && _0x18f02c.color) {
    _0x6cdeb5 = _0x18f02c.color;
  }
  if (_0x6cdeb5 !== null) {
    _0x2f55f1.push("color:" + _0x6cdeb5);
  }
  if (_0x18f02c && _0x18f02c.bold) {
    _0x2f55f1.push("font-weight:bold");
  }
  if (_0x5ac0b5.length >= 16) {
    _0x5ac0b5 = _0x5ac0b5.substr(0, 14) + "&hellip;";
  }
  switch (_0xac8d01) {
    case 100:
      _0x29650a = '<img src="/res/crown.png" class="nameIcon">';
      _0x1a01e5 = "Champion";
      break;
    case 101:
      _0x29650a =
        '<img src="' +
        CDN_URL("/res/ield.png") +
        '" alt="Mod" class="nameIcon">';
      _0x1a01e5 = "Moderator";
      break;
    default:
      if (_0xac8d01 >= 110 && _0xac8d01 <= 118) {
        _0x29650a =
          '<img src="' +
          CDN_URL(
            "/res/" +
              {
                110: "gstr",
                111: "jsT",
                112: "blt",
                113: "blo",
                114: "bls",
                115: "blz",
                116: "bll",
                117: "blj",
                118: "bli",
              }[_0xac8d01] +
              ".png",
          ) +
          '" alt="D" class="nameIcon">';
        _0x1a01e5 = "Jstris supporter";
      } else if (_0xac8d01 >= 1000 && _0xac8d01 <= 2000) {
        _0xac8d01 -= 1000;
        let _0x4b9bef = String.fromCharCode(
          65 + ((_0xac8d01 & 992) >> 5),
        );
        _0x4b9bef += String.fromCharCode(65 + (_0xac8d01 & 31));
        _0x29650a =
          '<img src="https://jstris.jezevec10.com/vendor/countries/flags/' +
          _0x4b9bef +
          '.png" alt="' +
          _0x4b9bef +
          '" class="nameIcon">';
        _0x1a01e5 = "Jstris supporter";
      } else if (_0xac8d01 === 999 && _0x18f02c && _0x18f02c.icon) {
        _0x29650a =
          '<img src="' +
          CDN_URL("/res/oe/" + _0x18f02c.icon + ".svg") +
          '" class="nameIcon_oe">';
        _0x1a01e5 = "Jstris supporter";
      }
  }
  if (_0x2f55f1.length) {
    _0x55bccb += ' style="' + _0x2f55f1.join(";") + '"';
  }
  return (
    '<a href="/u/' +
    _0x5b384f +
    '" class="ut" target="_blank"' +
    (_0x55bccb += _0x1a01e5 ? ' title="' + _0x1a01e5 + '"' : "") +
    ">" +
    _0x29650a +
    _0x5ac0b5 +
    "</a>"
  );
};
Live.prototype.getName = function (_0x41765e, _0x3d2b41) {
  var _0x51585d = _0x3d2b41 === undefined || _0x3d2b41;
  if (
    this.clients[_0x41765e] !== undefined &&
    this.clients[_0x41765e].name !== null
  ) {
    if (
      _0x51585d &&
      (arrayContains(this.authList, parseInt(_0x41765e)) ||
        (this.cid == parseInt(_0x41765e) && this.authorized))
    ) {
      return this.getAuthorizedNameLink(
        this.clients[_0x41765e].name,
        this.clients[_0x41765e].type,
        this.clients[_0x41765e],
      );
    } else {
      return this.clients[_0x41765e].name;
    }
  } else if (_0x41765e === -1) {
    return "";
  } else if (_0x41765e === -2) {
    return "<span style='color:#00D928'>" + i18n.newsUser + "</span>";
  } else if (_0x41765e === -3) {
    return (
      "<span style='color:#FF3700'>" + i18n.serverUser + "</span>"
    );
  } else if (_0x41765e === -4) {
    return "<span style='color:yellow'>" + i18n.warning2 + "</span>";
  } else if (_0x41765e === -5) {
    return "<i class='glyphicon glyphicon-info-sign'></i>";
  } else {
    return i18n.noNamed + _0x41765e.toString();
  }
};
Live.prototype.forgetRoomPlayers = function () {
  var _0xba5598 = null;
  if (this.clients[this.cid] !== undefined) {
    _0xba5598 = this.clients[this.cid];
  }
  this.clients = {};
  this.players = Array();
  this.bots = Array();
  this.authList = Array();
  this.roomJoinTimes = {};
  if (_0xba5598 !== null) {
    this.clients[this.cid] = _0xba5598;
  }
};
Live.prototype.createPrivatePracticeRoom = function (_0x3abcf6) {
  var _0x2d0e2e = this.getParameterByName("play");
  if (
    !!_0x3abcf6 ||
    (!this.urlPlayParamApplied &&
      !this.joinRemote &&
      _0x2d0e2e != "" &&
      !isNaN(parseInt(_0x2d0e2e)))
  ) {
    this.clearRoomForm();
    this.roomNameInput.value = "The Private Room";
    this.isPrivateInput.checked = true;
    this.makeRoom();
  }
};
Live.prototype.onCIDassigned = function () {
  if (this.lastDC === 4008) {
    this.lastDC = null;
    var _0x1cb2d9 = JSON.stringify(this.createRoomRequest);
    this.safeSend(_0x1cb2d9);
    this.createRoomRequest = null;
  } else if (this.authReady) {
    this.createPrivatePracticeRoom();
  }
  if (typeof ga == "function") {
    var _0x514228 = this.isProxy ? "proxy" : "normal";
    ga("send", {
      hitType: "event",
      eventCategory: "Connect",
      eventAction: _0x514228,
    });
  }
  this.p.Settings.removeBanArtifact();
};
Live.prototype.readSpecs = function (_0x423eb8, _0x2e67c4) {
  var _0x2f979c = "";
  var _0x15f914 = 0;
  for (var _0x5bca2d in _0x423eb8.spec) {
    var _0x371028 = parseInt(_0x5bca2d);
    if (!isNaN(_0x371028)) {
      if (this.clients[_0x371028] === undefined) {
        this.clients[_0x371028] = new Client(_0x371028);
      }
      if (
        _0x423eb8.spec[_0x5bca2d].hasOwnProperty("auth") &&
        _0x423eb8.spec[_0x5bca2d].auth === true
      ) {
        this.clients[_0x371028].auth = true;
        this.authList.push(_0x371028);
      }
      if (_0x2e67c4 && _0x423eb8.spec[_0x5bca2d].n !== undefined) {
        this.clients[_0x371028].name = _0x423eb8.spec[_0x5bca2d].n;
      }
      if (_0x423eb8.spec[_0x5bca2d].hasOwnProperty("type")) {
        this.clients[_0x371028].type = _0x423eb8.spec[_0x5bca2d].type;
        if (_0x423eb8.spec[_0x5bca2d].hasOwnProperty("icn")) {
          this.clients[_0x371028].icon =
            _0x423eb8.spec[_0x5bca2d].icn;
        }
      }
      if (_0x423eb8.spec[_0x5bca2d].hasOwnProperty("col")) {
        this.clients[_0x371028].color = _0x423eb8.spec[_0x5bca2d].col;
      }
      if (_0x15f914 != 0) {
        _0x2f979c += ", ";
      }
      _0x2f979c += this.getName(_0x371028);
      _0x15f914++;
    }
  }
  this.showInChat(
    "",
    "<em>" + i18n.watching + ": " + _0x2f979c + "</em>",
  );
};
Live.prototype.chatJoiningInfoEnabled = function (_0x4a0f32) {
  return (
    this.players.length < 8 ||
    (this.players.length < 20 &&
      arrayContains(this.authList, _0x4a0f32)) ||
    (this.clients[_0x4a0f32] && this.clients[_0x4a0f32].type >= 100)
  );
};
Live.prototype.showMessageAboutJoin = function (
  _0x1ffcda,
  _0x57e20b,
) {
  if (
    this.clients[_0x1ffcda] !== undefined &&
    this.clients[_0x1ffcda].name !== null
  ) {
    if (this.chatJoiningInfoEnabled(_0x1ffcda)) {
      var _0x17af62 = "<em>" + this.getName(_0x1ffcda) + " ";
      _0x17af62 += _0x57e20b
        ? i18n.userCame + ".</em>"
        : i18n.userJoined + ".</em>";
      this.showInChat("", _0x17af62);
      if (this.p.Settings.soundEnabled) {
        createjs.Sound.play("ding");
      }
      this.p.pageTitle(
        this.getName(_0x1ffcda, false) + " " + i18n.joined + "!",
      );
      setTimeout(
        function () {
          this.p.pageTitle("Jstris");
        }.bind(this),
        1500,
      );
    }
  } else {
    this.roomJoinTimes[_0x1ffcda] = [];
    this.roomJoinTimes[_0x1ffcda][0] = this.p.timestamp();
    this.roomJoinTimes[_0x1ffcda][1] = _0x57e20b;
  }
};
Live.prototype.updateConnectionInfo = function () {
  var _0x51ad12 = this.isProxy ? " [P]" : "";
  var _0x3a2d30 = "";
  if (!this.connected) {
    _0x3a2d30 = this.cid === 0 ? " [F]" : " [DC]";
  }
  var _0x14442c = this.connected ? i18n.connected : i18n.notConnected;
  var _0x459d71 = "";
  if (this.serverId) {
    _0x459d71 = "s:" + this.serverId + ", ";
  }
  this.p.connectStatusElement.innerHTML =
    _0x14442c +
    _0x51ad12 +
    _0x3a2d30 +
    " (client " +
    this.cid +
    "), " +
    _0x459d71 +
    this.version;
};
Live.prototype.handleResponse = function (_0x1abc4e) {
  switch (_0x1abc4e.t) {
    case 1:
      this.cid = _0x1abc4e.cid;
      this.serverId = _0x1abc4e.s;
      if (this.clients[this.cid] === undefined) {
        this.clients[this.cid] = new Client(this.cid);
      }
      if (!this.authorized) {
        if (_0x1abc4e.n.i >= 0) {
          this.p.Settings.setCookie("nick", _0x1abc4e.n.i);
        }
        this.setChatName(_0x1abc4e.n.n);
      }
      if (_0x1abc4e.hasOwnProperty("r")) {
        this.servers = _0x1abc4e.r;
        let _0xa23267 = document.getElementById("srvSel");
        _0xa23267.innerHTML = "";
        let _0x45be62 = document.createElement("option");
        _0x45be62.value = "0";
        _0x45be62.selected = true;
        _0x45be62.textContent = "Default";
        _0xa23267.appendChild(_0x45be62);
        for (let _0x429cc3 in this.servers) {
          let _0x4703d8 = document.createElement("option");
          _0x4703d8.value = _0x429cc3;
          _0x4703d8.textContent = this.servers[_0x429cc3].n;
          _0xa23267.appendChild(_0x4703d8);
        }
      }
      this.connected = true;
      this.onCIDassigned();
      this.updateConnectionInfo();
      break;
    case 2:
      if (this.clients[_0x1abc4e.cid] === undefined) {
        this.clients[_0x1abc4e.cid] = new Client(_0x1abc4e.cid);
      }
      if (_0x1abc4e.hasOwnProperty("type")) {
        this.clients[_0x1abc4e.cid].type = _0x1abc4e.type;
        if (_0x1abc4e.hasOwnProperty("icn")) {
          this.clients[_0x1abc4e.cid].icon = _0x1abc4e.icn;
        }
      }
      if (_0x1abc4e.hasOwnProperty("col")) {
        this.clients[_0x1abc4e.cid].color = _0x1abc4e.col;
      }
      if (_0x1abc4e.hasOwnProperty("team")) {
        this.clients[_0x1abc4e.cid].team = _0x1abc4e.team;
      }
      if (_0x1abc4e.n !== undefined) {
        this.clients[_0x1abc4e.cid].name = _0x1abc4e.n;
      }
      if (
        _0x1abc4e.hasOwnProperty("auth") &&
        _0x1abc4e.auth === true
      ) {
        this.authList.push(_0x1abc4e.cid);
        this.clients[_0x1abc4e.cid].auth = true;
      }
      var _0x2ba4ba =
        _0x1abc4e.hasOwnProperty("so") && _0x1abc4e.so === true;
      if (!_0x2ba4ba) {
        var _0x2f19e6 = this.getGameSlot(
          _0x1abc4e.cid,
          _0x1abc4e.rc,
          _0x1abc4e.team,
        );
        this.p.GS.CID(_0x1abc4e.cid).setName(
          this.getName(_0x1abc4e.cid),
        );
        if (
          _0x1abc4e.hasOwnProperty("bot") &&
          _0x1abc4e.bot === true
        ) {
          this.bots.push(_0x1abc4e.cid);
        }
        if (
          !_0x2f19e6 &&
          (!!this.p.Settings.rescaleNow || !this.LiveGameRunning)
        ) {
          this.p.GS.autoScale();
        }
      }
      this.showMessageAboutJoin(_0x1abc4e.cid, _0x2ba4ba);
      break;
    case 3:
      if (_0x1abc4e.cid === this.cid && _0x1abc4e.sitout === 1) {
        if (!this.sitout) {
          this.spectatorMode(1);
        }
        break;
      }
      if (_0x1abc4e.sitout <= 1) {
        if (
          this.liveMode === 2 &&
          this.clients[_0x1abc4e.cid].hasOwnProperty("team")
        ) {
          var _0x298975 = this.clients[_0x1abc4e.cid].team;
          _0x4f56f6 = this.p.GS.teamMembers[_0x298975].indexOf(
            _0x1abc4e.cid,
          );
          this.p.GS.teamMembers[_0x298975].splice(_0x4f56f6, 1);
        }
        if ((_0x4f56f6 = this.players.indexOf(_0x1abc4e.cid)) > -1) {
          this.players.splice(_0x4f56f6, 1);
        }
        if ((_0x4f56f6 = this.bots.indexOf(_0x1abc4e.cid)) > -1) {
          this.bots.splice(_0x4f56f6, 1);
        }
        this.p.GS.CID(_0x1abc4e.cid).vacantClear();
        if (
          !this.p.gameEnded &&
          this.currentTarget === _0x1abc4e.cid
        ) {
          this.changeTarget();
        }
      } else if (
        _0x1abc4e.sitout === 2 &&
        this.chatJoiningInfoEnabled(_0x1abc4e.cid)
      ) {
        this.showInChat(
          "",
          "<em>" +
            i18n.spectator +
            " " +
            this.getName(_0x1abc4e.cid) +
            " " +
            i18n.hasLeft +
            ".</em>",
        );
      }
      if (
        _0x1abc4e.sitout === 1 &&
        this.chatJoiningInfoEnabled(_0x1abc4e.cid)
      ) {
        this.showInChat(
          "",
          "<em>" +
            this.getName(_0x1abc4e.cid) +
            " " +
            i18n.isSpectating +
            ".</em>",
        );
      }
      if (_0x1abc4e.sitout === 0 || _0x1abc4e.sitout === 2) {
        var _0xe03422 = this.authList.indexOf(_0x1abc4e.cid);
        if (_0xe03422 > -1) {
          this.authList.splice(_0xe03422, 1);
        }
        delete this.clients[_0x1abc4e.cid];
      }
      break;
    case 4:
      this.forgetRoomPlayers();
      if (objSize(_0x1abc4e.spec) > 0) {
        this.readSpecs(_0x1abc4e, true);
      }
      if (objSize(_0x1abc4e.players) > 0) {
        for (var _0x3e9ed5 in _0x1abc4e.players) {
          var _0x547f83 = parseInt(_0x3e9ed5);
          if (!isNaN(_0x547f83)) {
            this.getGameSlot(
              _0x547f83,
              _0x1abc4e.players[_0x3e9ed5].rc,
              _0x1abc4e.players[_0x3e9ed5].team,
            );
            if (this.clients[_0x547f83] === undefined) {
              this.clients[_0x547f83] = new Client(_0x547f83);
            }
            if (_0x1abc4e.players[_0x3e9ed5].n !== undefined) {
              this.clients[_0x547f83].name =
                _0x1abc4e.players[_0x3e9ed5].n;
            }
            if (
              _0x1abc4e.players[_0x3e9ed5].hasOwnProperty("bot") &&
              _0x1abc4e.players[_0x3e9ed5].bot === true
            ) {
              this.bots.push(_0x547f83);
            }
            if (
              _0x1abc4e.players[_0x3e9ed5].hasOwnProperty("auth") &&
              _0x1abc4e.players[_0x3e9ed5].auth === true
            ) {
              this.clients[_0x547f83].auth = true;
              this.authList.push(_0x547f83);
            }
            if (_0x1abc4e.players[_0x3e9ed5].hasOwnProperty("type")) {
              this.clients[_0x547f83].type =
                _0x1abc4e.players[_0x3e9ed5].type;
              if (
                _0x1abc4e.players[_0x3e9ed5].hasOwnProperty("icn")
              ) {
                this.clients[_0x547f83].icon =
                  _0x1abc4e.players[_0x3e9ed5].icn;
              }
            }
            if (_0x1abc4e.players[_0x3e9ed5].hasOwnProperty("col")) {
              this.clients[_0x547f83].color =
                _0x1abc4e.players[_0x3e9ed5].col;
            }
            if (_0x1abc4e.players[_0x3e9ed5].hasOwnProperty("team")) {
              this.clients[_0x547f83].team =
                _0x1abc4e.players[_0x3e9ed5].team;
            }
            this.p.GS.CID(_0x547f83).setName(this.getName(_0x547f83));
          }
        }
        this.p.play = false;
        this.onGameEnd();
        this.LiveGameRunning = _0x1abc4e.play == "True";
        if (
          this.LiveGameRunning &&
          (this.sitout ||
            this.showInChat("", "<em>" + i18n.waitNext2 + "</em>"),
          this.p.paintMatrixWithColor(9),
          this.p.getPlace(true, true),
          _0x1abc4e.trM === 2)
        ) {
          this.p.transmitMode = 2;
          this.p.GS.extendedAvailable = true;
          for (var _0x5e927e in _0x1abc4e.players) {
            var _0x460ecf = parseInt(_0x5e927e);
            if (
              !isNaN(_0x460ecf) &&
              _0x460ecf in this.p.GS.cidSlots &&
              this.clients[_0x460ecf]
            ) {
              (_0x484429 = new Replayer(
                this.p.GS.CID(_0x460ecf).v,
              )).debug = this.p.debug;
              _0x484429.linesAttack = this.p.linesAttack;
              _0x484429.comboAttack = this.p.comboAttack;
              _0x484429.r.c = {};
              _0x484429.restart();
              this.clients[_0x460ecf].rep = _0x484429;
              this.clients[_0x460ecf].replay2Dec = null;
            }
          }
        }
        this.setResetButton(_0x1abc4e.ss || this.LiveGameRunning);
        this.p.GS.autoScale();
      } else {
        var _0x438d72 = 6;
        if (
          this.roomConfig &&
          this.roomConfig.hasOwnProperty("max") &&
          this.roomConfig.max <= 7
        ) {
          _0x438d72 = Math.max(1, this.roomConfig.max - 1);
        }
        this.p.GS.setup(_0x438d72);
        this.setResetButton(false);
      }
      this.gid = _0x1abc4e.gid;
      this.roundSeed = _0x1abc4e.seed || "";
      this.liveSeed = this.p.getAdjustedLiveSeed(_0x1abc4e.seed);
      break;
    case 5:
      if (this.shouldWait(_0x1abc4e)) {
        return;
      }
      this.notPlaying = [];
      this.p.transmitMode = _0x1abc4e.trM;
      this.p.GS.extendedAvailable = _0x1abc4e.trM >= 1;
      if (this.p.transmitMode === 0) {
        for (
          var _0x21256b = 0;
          _0x21256b < this.p.GS.shownSlots;
          _0x21256b++
        ) {
          this.p.GS.slots[_0x21256b].v.changeSkin(this.p.skinId);
        }
      }
      this.p.GS.autoScale();
      this.liveSeed = this.p.getAdjustedLiveSeed(_0x1abc4e.seed);
      if (_0x1abc4e.hasOwnProperty("map")) {
        this.liveMap = _0x1abc4e.map.id;
        this.showInChat(
          "Map",
          "<a target='_blank' href='/map/" +
            this.liveMap +
            "'>" +
            _0x1abc4e.map.name +
            "</a> (D=" +
            _0x1abc4e.map.diff +
            "%)",
        );
      } else {
        this.liveMap = null;
      }
      if (_0x1abc4e.hasOwnProperty("mode")) {
        this.liveModeId = _0x1abc4e.mode.id;
      } else {
        this.liveModeId = null;
      }
      this.umLoadingPhase = !!_0x1abc4e.umLoad;
      if (this.sitout) {
        if (this.liveMap) {
          this.p.GS.extendedAvailable = false;
        }
        this.onReset();
      } else {
        this.p.pmode = 0;
        this.p.play = false;
        if (this.p.starting) {
          clearInterval(this.p.interval);
          this.p.starting = false;
        }
        this.p.blockRNG = alea(this.liveSeed);
        this.p.RNG = alea(this.liveSeed);
        this.p.blockSeed = this.liveSeed;
        this.p.readyGo();
        this.statsSent = false;
        this.setResetProgress(0);
        this.setResetButton(true);
        this.LiveGameRunning = true;
      }
      if (this.liveMode === 2 && typeof ga == "function") {
        ga("send", {
          hitType: "event",
          eventCategory: "Team",
          eventAction: "start",
        });
      }
      this.gid = _0x1abc4e.gid;
      this.roundSeed = _0x1abc4e.seed || "";
      break;
    case 6:
      if (
        _0x1abc4e.hasOwnProperty("e") &&
        !this.hasOwnProperty("chatErrShown")
      ) {
        this.chatErrShown = true;
        var _0x3bbaae =
          '<span style="color:#ff9100"><b>' +
          i18n.oops +
          "</b> " +
          trans(i18n.chatNA, {
            chReq: 2,
          }) +
          "</span>";
        _0x3bbaae +=
          ' <a href="/about/chat" target="_blank">' +
          i18n.leMore +
          "</a>";
        this.showInChat("", _0x3bbaae);
        break;
      }
      _0x1abc4e.m = _0x1abc4e.m.replace(/\\"/g, '"');
      if (this.authorized) {
        _0x1abc4e.m = this.resolveMention(_0x1abc4e);
      }
      if (_0x1abc4e.a && _0x1abc4e.a === 1) {
        this.resetWinCounter();
      }
      let _0x65cb6f = this.getChatLineClassesFor(_0x1abc4e.cid);
      if (
        _0x1abc4e.hasOwnProperty("cl") &&
        _0x1abc4e.cl !== null &&
        _0x1abc4e.cl.length
      ) {
        if (_0x65cb6f && _0x65cb6f.length !== 0) {
          Array.prototype.push.apply(_0x65cb6f, _0x1abc4e.cl);
        } else {
          _0x65cb6f = _0x1abc4e.cl;
        }
      }
      if (
        this.Friends.friendsOpened &&
        _0x1abc4e.cid !== this.cid &&
        _0x1abc4e.cid > 0
      ) {
        this.friendsBtn.className = "rchNew";
      }
      this.showInChat(
        this.getName(_0x1abc4e.cid),
        _0x1abc4e.m,
        _0x65cb6f,
      );
      break;
    case 7:
      if (_0x1abc4e.cid === this.cid) {
        if (!this.LiveGameRunning) {
          break;
        }
        if (this.umLoadingPhase) {
          this.umLoadingPhase = false;
          this.p.starting = false;
          clearInterval(this.p.interval);
          this.p.Caption.hide();
        } else if (this.liveMode === 3) {
          this.p.Caption.liveRaceFinished();
          break;
        }
        this.p.paintMatrixWithColor(9);
        this.p.play = false;
        this.p.lastSeen = null;
        this.onGameEnd();
        this.statsSent = true;
        this.p.getPlace(true, true);
        this.p.redraw();
      } else if (this.p.GS.cidSlots.hasOwnProperty(_0x1abc4e.cid)) {
        this.notPlaying.push(_0x1abc4e.cid);
        if (
          !this.p.gameEnded &&
          this.currentTarget === _0x1abc4e.cid
        ) {
          this.changeTarget();
        }
        var _0x4a3775 = this.p.GS.CID(_0x1abc4e.cid);
        _0x4a3775.slotDiv.classList.add("np");
        if (_0x1abc4e.v) {
          this.places[_0x1abc4e.cid] = _0x1abc4e.p;
        } else {
          this.places[_0x1abc4e.cid] = 0;
        }
        _0x4a3775.v.afterRedraw();
      }
      break;
    case 8:
      if (this.clients[_0x1abc4e.cid] === undefined) {
        this.clients[_0x1abc4e.cid] = new Client(_0x1abc4e.cid);
      }
      this.clients[_0x1abc4e.cid].name = _0x1abc4e.n;
      if (
        _0x1abc4e.cid === this.cid &&
        _0x1abc4e.hasOwnProperty("ti")
      ) {
        this.sTier = _0x1abc4e.ti;
        if (
          _0x1abc4e.hasOwnProperty("e") &&
          _0x1abc4e.e.hasOwnProperty("notif") &&
          typeof jstris != "undefined"
        ) {
          jstris.notif("activ");
        }
      }
      var _0x40b3ec = this;
      this.emoteAutocomplete.onEmoteObjectReady = function (
        _0x83e6c4,
      ) {
        _0x40b3ec.initEmoteSelect(_0x83e6c4);
      };
      this.emoteAutocomplete.loadEmotesIndex("EmS1.t" + this.sTier);
      if (this.sTier < 2 && this.p.skinId >= 1000) {
        this.p.changeSkin(0);
      }
      if (_0x1abc4e.hasOwnProperty("type")) {
        this.clients[_0x1abc4e.cid].type = _0x1abc4e.type;
        if (_0x1abc4e.hasOwnProperty("icn")) {
          this.clients[_0x1abc4e.cid].icon = _0x1abc4e.icn;
        }
      }
      if (_0x1abc4e.hasOwnProperty("col")) {
        this.clients[_0x1abc4e.cid].color = _0x1abc4e.col;
      }
      if (
        _0x1abc4e.hasOwnProperty("auth") &&
        _0x1abc4e.auth === true
      ) {
        this.clients[_0x1abc4e.cid].auth = true;
        this.authList.push(parseInt(_0x1abc4e.cid));
      }
      if (_0x1abc4e.cid in this.p.GS.cidSlots) {
        this.p.GS.CID(_0x1abc4e.cid).setName(
          this.getName(_0x1abc4e.cid),
        );
      }
      if (this.roomJoinTimes[_0x1abc4e.cid] !== undefined) {
        if (
          this.roomJoinTimes[_0x1abc4e.cid][0] >=
          this.p.timestamp() - 1000
        ) {
          this.showMessageAboutJoin(
            _0x1abc4e.cid,
            this.roomJoinTimes[_0x1abc4e.cid][1],
          );
        }
        delete this.roomJoinTimes[_0x1abc4e.cid];
      }
      break;
    case 9:
      this.umLoadingPhase = false;
      if (this.statsSent) {
        for (
          _0x21256b = 0;
          _0x21256b < this.players.length;
          _0x21256b++
        ) {
          if (
            this.players[_0x21256b] !== this.cid &&
            this.notPlaying.indexOf(this.players[_0x21256b]) === -1
          ) {
            this.winnerCID = this.players[_0x21256b];
            break;
          }
        }
      } else {
        if (this.liveMode === 2) {
          this.p.place = 1;
          this.p.placePrinted = true;
        } else if (this.liveMode !== 3) {
          this.p.getPlace(false, true);
        }
        this.sendStats();
        this.winnerCID = this.cid;
        this.onGameEnd();
        if (typeof ga == "function") {
          ga("send", {
            hitType: "event",
            eventCategory: "Game",
            eventAction: "victory",
          });
        }
      }
      this.places[this.winnerCID] = 1;
      if (this.winnerCID in this.p.GS.cidSlots) {
        this.p.GS.CID(this.winnerCID).v.afterRedraw();
      }
      if (this.liveMode === 2) {
        this.displayTeamResults(_0x1abc4e.r);
      } else {
        this.displayResults(_0x1abc4e.r.res, false);
      }
      this.lastGameId = _0x1abc4e.r.gid;
      this.saveLink.href = "/games/" + this.lastGameId;
      if (!this.sitout) {
        this.setResetButton(false);
        this.p.redraw();
      }
      this.LiveGameRunning = false;
      break;
    case 10:
      this.displayLobby(_0x1abc4e.d);
      break;
    case 12:
      this.rc = _0x1abc4e.rc;
      if (this.rid !== "" && _0x1abc4e.re === 0) {
        this.chatBox.textContent = "";
        if (this.hasOwnProperty("chatErrShown")) {
          delete this.chatErrShown;
        }
        this.showInChat(
          "",
          "<em>" + i18n.welcomeIn + " " + _0x1abc4e.n + "!</em>",
        );
      }
      this.rid = _0x1abc4e.rid;
      if (_0x1abc4e.hasOwnProperty("so") && _0x1abc4e.so === 1) {
        this.spectatorMode(1);
        this.showInChat("", "<em>" + i18n.roomFull + "</em>");
      } else if (this.sitout) {
        this.spectatorModeOff(1);
      }
      this.iAmHost =
        _0x1abc4e.hasOwnProperty("h") && _0x1abc4e.h === this.cid;
      this.onRoomJoined(_0x1abc4e.rid, _0x1abc4e.p, _0x1abc4e.n);
      this.p.GS.extendedAvailable = false;
      this.liveMode = _0x1abc4e.conf.mode;
      for (var _0x512583 in this.p.GS.teamMembers) {
        delete this.p.GS.teamMembers[_0x512583];
      }
      this.applyConfig(_0x1abc4e);
      if (!this.sitout && _0x1abc4e.hasOwnProperty("ss")) {
        this.setResetProgress(_0x1abc4e.ss);
        this.setResetButton(true);
      } else {
        this.setResetProgress(0);
      }
      break;
    case 13:
      if (
        (this.p.pmode && this.p.livePmode !== 9) ||
        this.p.gameEnded
      ) {
        return;
      }
      this.p.garbageQueue(_0x1abc4e.a);
      break;
    case 14:
      if (!_0x1abc4e.s) {
        break;
      }
      this.p.Replay.postLiveData(
        _0x1abc4e.gid,
        this.cid,
        this,
        _0x1abc4e.token,
      );
      break;
    case 15:
      this.displayResults(_0x1abc4e.r.res, true);
      break;
    case 16:
      if (objSize(_0x1abc4e.spec) > 0) {
        this.readSpecs(_0x1abc4e, false);
      } else {
        this.showInChat("", "<em>" + i18n.noSpectators + "</em>");
      }
      break;
    case 17:
      if (
        !this.p.gameEnded &&
        !this.p.pmode &&
        (!this.p.Bots || this.p.Bots.mode == 0)
      ) {
        this.p.solidStartRaising();
      }
      break;
    case 18:
      this.applyConfig(_0x1abc4e);
      break;
    case 19:
      if (_0x1abc4e.id !== 0) {
        this.p.Replay.onSaved = this.onReplaySaved.bind(this);
        this.p.Replay.postData(_0x1abc4e.id, this);
      } else {
        this.p.Replay.uploadError(
          this,
          "REJECTED - " + _0x1abc4e.err,
        );
      }
      break;
    case 20:
      if (_0x1abc4e.cid === this.cid) {
        this.team = _0x1abc4e.team;
        this.updateTeamData(this.p.GS.teamData);
      } else if (this.clients[_0x1abc4e.cid] !== undefined) {
        var _0x4a2649 = this.clients[_0x1abc4e.cid].team;
        this.clients[_0x1abc4e.cid].team = _0x1abc4e.team;
        if (
          _0x4a2649 !== undefined &&
          this.p.GS.teamMembers[_0x4a2649]
        ) {
          var _0x4f56f6 = this.p.GS.teamMembers[_0x4a2649].indexOf(
            _0x1abc4e.cid,
          );
          this.p.GS.teamMembers[_0x4a2649].splice(_0x4f56f6, 1);
        }
        if (_0x1abc4e.team in this.p.GS.teamMembers) {
          this.p.GS.teamMembers[_0x1abc4e.team].push(_0x1abc4e.cid);
        }
        this.p.GS.autoScale();
      }
      break;
    case 21:
      break;
    case 23:
      var _0x484429;
      if (
        !((_0x547f83 = this.rcS[_0x1abc4e.rc]) in this.p.GS.cidSlots)
      ) {
        break;
      }
      (_0x484429 = new Replayer(this.p.GS.CID(_0x547f83).v)).debug =
        this.p.debug;
      _0x484429.linesAttack = this.p.linesAttack;
      _0x484429.comboAttack = this.p.comboAttack;
      this.clients[_0x547f83].rep = _0x484429;
      this.clients[_0x547f83].replay2Dec = null;
      _0x1abc4e.v = 3.3;
      _0x1abc4e.se = 0;
      _0x1abc4e.m = 6553600;
      _0x1abc4e.seed = this.liveSeed;
      _0x484429.r.c = _0x1abc4e;
      _0x484429.initReplay();
      if (this.loadMapForOpponents) {
        _0x484429.loadMap(
          this.p.MapManager.matrix,
          this.p.MapManager.mapData.queue,
        );
        _0x484429.pmode = 6;
      }
      _0x484429.restart();
      if (_0x1abc4e.bp) {
        this.p.GS.CID(_0x547f83).v.customSkinPath = _0x1abc4e.bp;
      }
      if (!_0x1abc4e.bp && _0x1abc4e.bs >= 1000) {
        _0x1abc4e.bs = 0;
      }
      this.p.GS.CID(_0x547f83).v.changeSkin(
        _0x1abc4e.bs,
        _0x1abc4e.mClr,
      );
      break;
    case 25:
      if (_0x1abc4e.cid in this.clients) {
        this.clients[_0x1abc4e.cid].rep = null;
        if (_0x1abc4e.cid in this.p.GS.cidSlots) {
          this.p.GS.CID(_0x1abc4e.cid).v.onReady();
        }
      }
      break;
    case 26:
      this.p.Caption.hide(this.p.Caption.LOADING);
      this.authReady = true;
      this.createPrivatePracticeRoom();
      if (_0x1abc4e.res) {
        this.Friends.friendsCount = _0x1abc4e.hasOwnProperty("f")
          ? _0x1abc4e.f
          : 0;
        if (_0x1abc4e.hasOwnProperty("mod") && _0x1abc4e.mod) {
          this.clients[this.cid].mod = true;
        }
        this.showInChat(
          "",
          i18n.signedAs + " " + this.getName(this.cid) + ".",
        );
      } else {
        this.authorized = false;
        this.setChatName(_0x1abc4e.n.n);
        this.p.Caption.loading(i18n.loginFail, 1);
        let _0x3e49d8 = trans(i18n.loginFail2, {
          name: "<b>" + _0x1abc4e.n.n + "</b>",
        });
        this.chatMajorWarning(_0x3e49d8, "dc");
      }
      break;
    case 27:
      this.roomHost = _0x1abc4e.h;
      if (_0x1abc4e.h === this.cid) {
        this.showInChat(
          "",
          (this.authorized
            ? '<span class="mention">@' + this.chatName + "</span> "
            : "") +
            "<em>" +
            i18n.newHost +
            "</em>",
        );
        this.iAmHost = true;
      }
      break;
    case 28:
      this.RoomInfo.acceptRoomDetail(_0x1abc4e);
      break;
    case 29:
      this.p.Replay.getData();
      var _0x4be366 = this.p.Replay.string;
      if (
        _0x4be366 &&
        this.p.Replay.config.seed.startsWith(_0x1abc4e.gid)
      ) {
        _0x1abc4e.r = _0x4be366;
      } else {
        _0x1abc4e.r = 0;
      }
      this.safeSend(JSON.stringify(_0x1abc4e));
      break;
    case 30:
      this.joinRemote = _0x1abc4e;
      this.joinRemote.ts = this.p.timestamp();
      break;
    case 31:
      if (!this.p.Items.avail()) {
        return;
      }
      if (_0x1abc4e.hasOwnProperty("c")) {
        this.p.Items.loadConf(_0x1abc4e.c);
      }
      if (_0x1abc4e.hasOwnProperty("s")) {
        this.p.Items.fs = true;
        this.p.Items.f = _0x1abc4e.s;
      }
      if (_0x1abc4e.hasOwnProperty("a")) {
        this.p.Items.item = _0x1abc4e.a;
        this.p.Items.use();
      }
      break;
    case 32:
      let _0x2f7195 = _0x1abc4e.j;
      let _0x5065ce = _0x1abc4e.s;
      this.Friends.connect(_0x5065ce, _0x2f7195);
      break;
    case 33:
      if (_0x1abc4e.hasOwnProperty("e")) {
        if (_0x1abc4e.e === 1) {
          this.showInChat(
            "<span style='color:green'>Completed</span>",
            "Not saved, you already completed this mode.",
          );
        } else if (_0x1abc4e.e === 2) {
          this.showInChat(
            "<span style='color:orange'>Not saved</span>",
            "Only personal bests are saved for this mode.",
          );
        }
        return;
      }
      const _0x58b708 = (_0x50007a) =>
        typeof _0x50007a != "string"
          ? ""
          : _0x50007a == "time"
            ? "s"
            : (_0x50007a.startsWith("var:") &&
                (_0x50007a = _0x50007a.slice(4)),
              _0x50007a.charAt(0).toUpperCase() + _0x50007a.slice(1));
      if (_0x1abc4e.hasOwnProperty("f")) {
        this.showInChat(
          "<span style='color:red'>Skipped</span>",
          '<a href="/usermodes/' +
            _0x1abc4e.mid +
            '" target="_blank">' +
            _0x1abc4e.n +
            "</a>",
        );
      } else {
        let _0x2876e5 = _0x1abc4e.r[0];
        if (
          typeof _0x1abc4e.r[0] == "number" &&
          _0x1abc4e.r[0] % 1 != 0
        ) {
          _0x2876e5 = _0x1abc4e.r[0].toFixed(2);
        }
        if (_0x1abc4e.r[1] == "time" && _0x1abc4e.r[0] > 0) {
          _0x2876e5 = sprintTimeFormat(_0x1abc4e.r[0], 3);
        }
        let _0x1158d3 =
          "<b>" + _0x2876e5 + "</b> " + _0x58b708(_0x1abc4e.r[1]);
        if (_0x1abc4e.r[3] != "none") {
          let _0x37843b = _0x1abc4e.r[2];
          if (
            typeof _0x1abc4e.r[2] == "number" &&
            _0x1abc4e.r[2] % 1 != 0
          ) {
            _0x37843b = _0x1abc4e.r[2].toFixed(2);
          }
          if (_0x1abc4e.r[3] == "time" && _0x1abc4e.r[2] > 0) {
            _0x37843b = sprintTimeFormat(_0x1abc4e.r[2], 3);
          }
          _0x1158d3 +=
            " | <b>" +
            _0x37843b +
            "</b> " +
            _0x58b708(_0x1abc4e.r[3]);
        }
        let _0x3391fa = "";
        if (
          _0x1abc4e.hasOwnProperty("replayHmac") &&
          _0x1abc4e.hasOwnProperty("x")
        ) {
          _0x3391fa = "<span id='rep-" + _0x1abc4e.x + "'></span>";
        }
        this.showInChat(
          "<span style='color:green'>Saved</span>",
          '<a href="/usermodes/' +
            _0x1abc4e.mid +
            '" target="_blank">' +
            _0x1abc4e.n +
            "</a>: " +
            _0x1158d3 +
            _0x3391fa,
        );
      }
      if (
        _0x1abc4e.hasOwnProperty("replayHmac") &&
        _0x1abc4e.hasOwnProperty("x") &&
        this.p.ModeManager
      ) {
        this.p.ModeManager.uploadReplayFromQueue(
          _0x1abc4e.x,
          _0x1abc4e.mid,
          _0x1abc4e.replayHmac,
          _0x1abc4e.timestamp,
          _0x1abc4e.id,
        );
      }
      if (_0x1abc4e.rr) {
        let _0x2af52b =
          _0x1abc4e.rr.newRating - _0x1abc4e.rr.oldRating;
        let _0x18f505 =
          (_0x2af52b > 0 ? "+" : "") +
          Math.round(_0x2af52b).toFixed(0);
        let _0x3f8acc = _0x1abc4e.rr.mapRating;
        let _0x282b55 = "";
        if (_0x1abc4e.rr.so === false) {
          _0x282b55 =
            ". Used " +
            _0x1abc4e.rr.res[0] +
            " of " +
            _0x1abc4e.rr.res[1] +
            " restarts!";
        }
        let _0x4c2946 =
          "<span style='color:" +
          (_0x2af52b >= 0 ? "#00ff00" : "#ff7400") +
          "'>" +
          _0x18f505 +
          "</span>";
        this.showInChat(
          "Rank",
          _0x4c2946 +
            ", new: <b>" +
            _0x1abc4e.rr.newRating.toFixed(0) +
            "</b>, quiz rating: " +
            _0x3f8acc.toFixed(0) +
            _0x282b55,
        );
      }
      break;
    case 35:
      var _0x14c415 =
        '<svg class="svg-inline--fa fa-w-16"><use href="/svg/fa.svg#fas-fa-gift"></use></svg><span>' +
        _0x1abc4e.g.from_link +
        " gifted " +
        _0x1abc4e.g.days +
        ' days of <span class="s-tag"><img src="/res/gstr.png">Supporter</span> to ' +
        _0x1abc4e.g.to_link +
        "</span>";
      this.chatMajorWarning(_0x14c415, "giftNotif", {
        closable: false,
      });
      break;
    case 36:
      if (this.umLoadingPhase) {
        this.umLoadingPhase = false;
        if (!this.sitout) {
          this.p.startReadyGo();
        }
      }
      break;
    case 97:
      if (this.showModListOfRooms) {
        this.showModListOfRooms(_0x1abc4e.data);
      }
      break;
    case 98:
      this.socket.close();
      break;
    case 99:
      this.showInChat(
        "",
        "<b>" + (this.p.timestamp() - this.pingSent) + "ms</b>",
      );
      break;
    case 100:
      alert(
        i18n.oldVer +
          "\n If you continue, your game will be unstable.",
      );
      this.chatBox.textContent = "";
      this.showInChat(
        "<span style='color:yellow'>" + i18n.warning2 + "</span>",
        trans(i18n.oldVer2, {
          key: "<b>CTRL+F5</b>",
        }) + "!!!",
      );
      break;
    case 101:
      alert(i18n.badRoom);
      this.joinRoom("2");
      break;
    default:
      console.log("Unknown");
  }
};
Live.prototype.applyConfig = function (_0x1a960c) {
  this.roomHost = _0x1a960c.h;
  this.roomConfig = _0x1a960c.conf;
  if (_0x1a960c.hasOwnProperty("edit")) {
    this.showInChat(
      "",
      "<b>" +
        i18n.stngsChanged +
        " (" +
        this.getName(_0x1a960c.edit) +
        ").</b>",
    );
  }
  if (
    _0x1a960c.conf.hasOwnProperty("ct") &&
    _0x1a960c.conf.hasOwnProperty("at")
  ) {
    this.p.linesAttack = _0x1a960c.conf.at;
    this.p.comboAttack = _0x1a960c.conf.ct;
  } else {
    _0x1a960c.conf.at = this.p.linesAttack = this.p.linesAttackDef;
    _0x1a960c.conf.ct = this.p.comboAttack = this.p.comboAttackDef;
  }
  if (_0x1a960c.conf.hasOwnProperty("asEx")) {
    this.p.excludedBlocksAS = _0x1a960c.conf.asEx.split(",");
  } else {
    _0x1a960c.conf.asEx = this.p.excludedBlocksAS = null;
  }
  if (_0x1a960c.conf.hasOwnProperty("gh")) {
    this.p.cheeseHeight = _0x1a960c.conf.gh;
  } else {
    _0x1a960c.conf.gh = this.p.cheeseHeight = 10;
  }
  if (_0x1a960c.conf.hasOwnProperty("sg")) {
    this.solidAfter = _0x1a960c.conf.sg;
  } else {
    this.solidAfter = _0x1a960c.conf.sg = 120;
  }
  if (_0x1a960c.conf.hasOwnProperty("gdm")) {
    this.gdm = _0x1a960c.conf.gdm;
    if (this.gdm !== 0) {
      this.p.GS.setTarget(-1);
      this.currentTarget = 0;
    }
  }
  this.p.RulesetManager.applyRule(_0x1a960c.conf, this.p.conf[0]);
  if (
    _0x1a960c.conf.hasOwnProperty("hostStart") &&
    _0x1a960c.conf.hostStart
  ) {
    this.hostStartMode = true;
  } else {
    this.hostStartMode = _0x1a960c.conf.hostStart = false;
  }
  if (_0x1a960c.conf.hasOwnProperty("noFW") && _0x1a960c.conf.noFW) {
    this.noFourWide = true;
  } else {
    this.noFourWide = _0x1a960c.conf.noFW = false;
  }
  if (_0x1a960c.conf.hasOwnProperty("bi")) {
    this.p.bigChance = _0x1a960c.conf.bi;
    if (_0x1a960c.conf.bi === 0) {
      this.p.conf[0].baseBlockSet = 1;
    } else {
      this.p.conf[0].baseBlockSet = 0;
    }
  } else {
    this.p.bigChance = 100000000;
  }
  if (_0x1a960c.conf.hasOwnProperty("xb")) {
    this.setXbuffer(_0x1a960c.conf.xb, false);
  }
  if (_0x1a960c.conf.hasOwnProperty("snr")) {
    this.p.snapRate = _0x1a960c.conf.snr;
  } else {
    this.p.snapRate = 1000;
  }
  if (_0x1a960c.conf.hasOwnProperty("lsnr")) {
    this.p.liveSnapRate = _0x1a960c.conf.lsnr * 100;
  } else {
    this.p.liveSnapRate = 100;
  }
  if (_0x1a960c.conf.hasOwnProperty("sgp")) {
    this.sgProfile = _0x1a960c.conf.sgp;
  } else {
    this.sgProfile = 0;
  }
  if (this.liveMode === 2) {
    if (_0x1a960c.hasOwnProperty("team")) {
      this.team = _0x1a960c.team;
    }
    if (_0x1a960c.hasOwnProperty("teams")) {
      this.p.GS.updateTeamNames(_0x1a960c.teams);
      this.updateTeamData(_0x1a960c.teams);
    }
  }
  if (this.liveMode === 3 && _0x1a960c.conf.hasOwnProperty("pmode")) {
    this.livePmodeTypes = _0x1a960c.conf.pmode;
  }
};
Live.prototype.updateTeamData = function (_0x4c5c7a) {
  var _0x33252b;
  for (_0x33252b in _0x4c5c7a) {
    var _0x5132b5;
    if (!(_0x33252b in this.teamButtons)) {
      _0x5132b5 = document.createElement("button");
      this.teamButtons[_0x33252b] = _0x5132b5;
      _0x5132b5.dataset.team = _0x33252b;
      _0x5132b5.classList.add("teamSelect");
      _0x5132b5.addEventListener(
        "click",
        function (_0x13cb81) {
          this.teamSwitch(_0x13cb81.target.dataset.team);
        }.bind(this),
        false,
      );
      this.tsArea.appendChild(_0x5132b5);
    }
    (_0x5132b5 = this.teamButtons[_0x33252b]).textContent =
      _0x4c5c7a[_0x33252b].name;
    _0x5132b5.style.backgroundColor = _0x4c5c7a[_0x33252b].color;
    if (_0x33252b === this.team) {
      _0x5132b5.disabled = true;
      this.myTeam.textContent = _0x4c5c7a[_0x33252b].name;
      this.myTeam.style.backgroundColor = _0x4c5c7a[_0x33252b].color;
    } else {
      _0x5132b5.disabled = false;
    }
  }
};
Live.prototype.teamSwitch = function (_0xadb637) {
  if (this.teamSwitchDisabled) {
    return false;
  }
  this.teamSwitchDisabled = true;
  setTimeout(
    function () {
      this.teamSwitchDisabled = false;
    }.bind(this),
    1000,
  );
  for (var _0x23b4ef in this.teamButtons) {
    this.teamButtons[_0x23b4ef].disabled = _0x23b4ef === _0xadb637;
  }
  var _0x1843b7 = '{"t":20,"team":"' + _0xadb637 + '"}';
  this.safeSend(_0x1843b7);
};
Live.prototype.startLocalBotPractice = function () {
  var _0x3a6cf3 = () => {
    this.p.Bots.mode = 1;
    this.p.Bots.start();
  };
  if (this.p.Bots) {
    _0x3a6cf3();
  } else {
    this.p.Caption.loading("Bots loading");
    var _0x2f0dac = document.createElement("script");
    _0x2f0dac.onload = () => {
      this.p.Bots = new Bots(this.p);
      this.p.Caption.hide(this.p.Caption.LOADING);
      _0x3a6cf3();
    };
    var _0x194d24 = "";
    if (conf_global.port == "9001") {
      _0x194d24 = Date.now();
    }
    _0x2f0dac.src = "/js/bot.js?v=" + conf_global.av + _0x194d24;
    document.head.appendChild(_0x2f0dac);
  }
};
Live.prototype.tryPlayParam = function () {
  var _0x32d147 = this.getParameterByName("play");
  var _0x2b9707 = null;
  if (_0x32d147 === "" || this.urlPlayParamApplied) {
    if (this.storedPlayParam) {
      _0x2b9707 = this.storedPlayParam;
      this.storedPlayParam = null;
    }
  } else {
    if (!this.authReady) {
      return true;
    }
    _0x2b9707 = {
      gameMode: parseInt(_0x32d147),
      mode: this.getParameterByName("mode"),
      rule: this.getParameterByName("rule"),
    };
    this.showInChat(
      "",
      "<em>" + i18n.privateRoom + " " + i18n.restartInfo + "</em>",
    );
    this.urlPlayParamApplied = true;
  }
  return (
    !!_0x2b9707 &&
    (this.toggleLobbby(false),
    _0x2b9707.gameMode === 10
      ? (this.startLocalBotPractice(), true)
      : (this.spectatorMode(2),
        _0x2b9707.rule &&
          this.p.RulesetManager.ruleSetChange(_0x2b9707.rule),
        (this.p.sprintMode = parseInt(_0x2b9707.mode)),
        (this.p.pmode = -1),
        this.p.startPractice(
          _0x2b9707.gameMode,
          isNaN(this.p.sprintMode),
        ),
        true))
  );
};
Live.prototype.onRoomJoined = function (
  _0x4eab1c,
  _0x17c8c4,
  _0x5614c7,
) {
  if (_0x4eab1c === "") {
    this.showInChat("", "<em><b>Room was not found!</b></em>");
  } else if (_0x4eab1c === ".") {
    this.showInChat(
      "",
      "<em><b>Room is full, please find another one in the lobby!</b></em>",
    );
  } else {
    this.roomName = _0x5614c7;
    this.msgCount = 0;
    this.onReset();
    this.p.GS.resetAll();
    this.rcS = {};
    this.players = Array();
    this.bots = Array();
    this.authList = Array();
    this.notPlaying = [];
    this.p.GS.reset();
    this.p.Items.isPriv = _0x17c8c4;
    let _0x5cd5b6 = true;
    if (_0x17c8c4) {
      let _0x61569d = this.tryPlayParam();
      if (_0x61569d) {
        _0x5cd5b6 = true;
      }
      if (!_0x61569d && _0x4eab1c.length < 15) {
        var _0x2d62d9 =
          "https://jstris.jezevec10.com/join/" + _0x4eab1c;
        this.showInChat(
          "",
          "<em>" +
            i18n.joinLinkInfo +
            "</em><span class='joinLink' onClick='selectText(this)'>" +
            _0x2d62d9 +
            "</span>",
        );
      }
    } else {
      this.urlPlayParamApplied = false;
    }
    if (_0x5cd5b6 && this.p.Bots) {
      this.p.Bots.mode = 0;
      this.p.Bots.cleanup();
    }
    if (this.rid != "2" && typeof ga == "function") {
      ga("send", {
        hitType: "event",
        eventCategory: "Game",
        eventAction: "customRoomJoin",
      });
    }
    this.Friends.sendStatus(_0x4eab1c, _0x17c8c4, _0x5614c7);
    $(window).trigger("room-join", [_0x4eab1c]);
  }
};
Live.prototype.displayLobby = function (_0x1cf30a) {
  var _0x3598a9 = [
    0,
    "Sprint",
    0,
    "Cheese",
    "Surv.",
    0,
    "Maps",
    0,
    0,
    "Usermodes",
  ];
  var _0x556df7 = this.rid;
  function _0x5deddd(_0x4f7e32, _0x337431) {
    _0x337431 = _0x337431 || 0;
    var _0x1a8d2f = "";
    var _0x31815a = _0x4f7e32.length;
    function _0x1e9d92(_0x527a72, _0x1c2d76) {
      return _0x1c2d76.g - _0x527a72.g;
    }
    if (_0x337431 === 1) {
      _0x1e9d92 = function (_0x4218a5, _0x172839) {
        if (_0x172839.w == null) {
          _0x172839.w = 0;
        }
        if (_0x4218a5.w == null) {
          _0x4218a5.w = 0;
        }
        var _0x630491 = _0x4218a5.w - _0x172839.w;
        if (_0x630491 !== 0) {
          return _0x630491;
        } else {
          return _0x172839.g - _0x4218a5.g;
        }
      };
    } else if (_0x337431 === 2) {
      _0x1e9d92 = function (_0x1e643a, _0x2f549d) {
        var _0x370006 = _0x2f549d.tr - _0x1e643a.tr;
        if (_0x370006 !== 0) {
          return _0x370006;
        } else {
          return _0x2f549d.g - _0x1e643a.g;
        }
      };
    } else if (_0x337431 === 3) {
      _0x1e9d92 = function (_0x592989, _0x37ba3b) {
        var _0x414a95 = _0x37ba3b.n > _0x592989.n ? -1 : 1;
        if (_0x37ba3b.n != _0x592989.n) {
          return _0x414a95;
        } else {
          return _0x37ba3b.g - _0x592989.g;
        }
      };
    }
    _0x4f7e32.sort(_0x1e9d92);
    for (var _0x16ffb7 = 0; _0x16ffb7 < _0x31815a; _0x16ffb7++) {
      var _0x442f69 = "";
      var _0x3d6bf8 = "";
      var _0x8af465 = _0x4f7e32[_0x16ffb7].c.toString();
      if (_0x4f7e32[_0x16ffb7].s > 0) {
        _0x442f69 =
          '<span class="plusSpec">+' +
          _0x4f7e32[_0x16ffb7].s +
          "</span>";
      }
      var _0x41d3de = "";
      var _0xb8aa8b = "";
      if (_0x4f7e32[_0x16ffb7].w) {
        _0xb8aa8b = getSVG("s-customw", "dark", "loIc");
      }
      if (_0x4f7e32[_0x16ffb7].mo === 0) {
        if (_0x4f7e32[_0x16ffb7].l) {
          _0xb8aa8b += getSVG("s-unlocked", "dark", "loIc");
        } else if (_0x337431 === 3) {
          _0xb8aa8b += getSVG("s-locked", "dark", "loIc");
        }
      }
      if (_0x4f7e32[_0x16ffb7].mo > 0) {
        let _0xeddec4;
        let _0x277311 = [0, "Cheese", "Team"];
        if (_0x4f7e32[_0x16ffb7].mo === 3) {
          _0xeddec4 = _0x3598a9[_0x4f7e32[_0x16ffb7].pm];
        } else {
          _0xeddec4 = _0x277311[_0x4f7e32[_0x16ffb7].mo];
        }
        _0x41d3de =
          '<div class="modeCol"><span class="gmTag">' +
          _0xeddec4 +
          "</span>" +
          _0xb8aa8b +
          "</div>";
      } else if (
        _0x4f7e32[_0x16ffb7].sl >= 0.1 &&
        (!_0xb8aa8b || _0x4f7e32[_0x16ffb7].id.length === 1)
      ) {
        _0x41d3de =
          '<div class="modeCol">' +
          getSVG("s-speedlimit", "dark", "slIc") +
          '<span class="slVal">' +
          _0x4f7e32[_0x16ffb7].sl.toFixed(1) +
          '</span><span class="ppsTag">PPS</span></div>';
      } else if (_0xb8aa8b) {
        _0x41d3de = '<div class="modeCol">' + _0xb8aa8b + "</div>";
      }
      if (_0x4f7e32[_0x16ffb7].m < 24) {
        _0x3d6bf8 = "/" + _0x4f7e32[_0x16ffb7].m;
      }
      if (
        _0x4f7e32[_0x16ffb7].c === 0 &&
        _0x4f7e32[_0x16ffb7].s > 0
      ) {
        _0x8af465 = "";
      }
      var _0x2f11c9 = "";
      var _0x137b54 = "";
      if (_0x556df7 === _0x4f7e32[_0x16ffb7].id) {
        _0x137b54 = " myRoom";
      } else {
        _0x2f11c9 =
          "onclick=\"window.joinRoom('" +
          _0x4f7e32[_0x16ffb7].id +
          "')\"";
      }
      _0x1a8d2f +=
        "<tr data-id=" +
        _0x4f7e32[_0x16ffb7].id +
        ' class="lobbyRow' +
        _0x137b54 +
        '"' +
        _0x2f11c9 +
        "><td >" +
        _0x4f7e32[_0x16ffb7].n +
        _0x41d3de +
        "</td><td class='gamesCol'>" +
        _0x4f7e32[_0x16ffb7].g +
        "</td><td class='plCol'>" +
        _0x8af465 +
        _0x442f69 +
        "</td><td class='pLimit'>" +
        _0x3d6bf8 +
        "</td></tr>";
    }
    return _0x1a8d2f;
  }
  document
    .getElementById("lobbyTable")
    .getElementsByTagName("tbody")[0].innerHTML = _0x5deddd(
    _0x1cf30a.s,
    0,
  );
  if (_0x1cf30a.c.length) {
    showElem(document.getElementById("rLSep"));
  } else {
    hideElem(document.getElementById("rLSep"));
  }
  document.getElementById("customTable").innerHTML = _0x5deddd(
    _0x1cf30a.c,
    1,
  );
  if (_0x1cf30a.o.length) {
    showElem(document.getElementById("ovLSep"));
  } else {
    hideElem(document.getElementById("ovLSep"));
  }
  document.getElementById("ovfTable").innerHTML = _0x5deddd(
    _0x1cf30a.o,
    2,
  );
  if (_0x1cf30a.g.length) {
    showElem(document.getElementById("guLSep"));
  } else {
    hideElem(document.getElementById("guLSep"));
  }
  document.getElementById("guTable").innerHTML = _0x5deddd(
    _0x1cf30a.g,
    2,
  );
  if (_0x1cf30a.l && _0x1cf30a.l.length) {
    showElem(document.getElementById("loLSep"));
  } else {
    hideElem(document.getElementById("loLSep"));
  }
  document.getElementById("loTable").innerHTML = _0x5deddd(
    _0x1cf30a.l,
    3,
  );
  this.RoomInfo.onLobbyRefresh();
};
Live.prototype.setupLobbyHandlers = function () {
  $(".roomListSep").each(function () {
    let _0x29ea8f = "lobby_" + $(this).attr("id");
    let _0x581137 = $(this).next();
    $(this).on("click", function () {
      $(_0x581137).toggle();
      $(this).toggleClass("up");
      $(this).toggleClass("down");
      if ($(this).hasClass("up")) {
        localStorage.removeItem(_0x29ea8f);
      } else {
        localStorage.setItem(_0x29ea8f, "1");
      }
    });
    if (localStorage.getItem(_0x29ea8f) !== null) {
      $(this).addClass("down");
      $(_0x581137).hide();
    } else {
      $(this).addClass("up");
    }
  });
};
Live.prototype.resetWinCounter = function () {
  for (
    let _0x4bd86d = 0;
    _0x4bd86d < this.p.GS.slots.length;
    _0x4bd86d++
  ) {
    this.p.GS.slots[_0x4bd86d].stats.winCounter.textContent = "0";
  }
};
Live.prototype.displayResults = function (_0x4770a9, _0x11e3c8) {
  this.resultsBox.style.display = "block";
  var _0x36efba = "";
  var _0x36eabc = _0x4770a9.length;
  for (var _0x208177 = 0; _0x208177 < _0x36eabc; _0x208177++) {
    _0x4770a9[_0x208177].forfeit = _0x4770a9[_0x208177].t < 0;
  }
  _0x4770a9.sort(function (_0x5af05a, _0x1f67d3) {
    return parseFloat(_0x1f67d3.t) - parseFloat(_0x5af05a.t);
  });
  if (_0x11e3c8) {
    _0x36efba +=
      '<table class="tstripes" width="100%"><tr><td></td><td width="100"><b>' +
      i18n.name +
      "</b></td><td><b>" +
      i18n.wins +
      "</b></td><td><b>" +
      i18n.time +
      "</b></td><td><b>" +
      i18n.rec +
      "</b></td><td><b>" +
      i18n.sent +
      "</b></td>                        <td><b>B2B</b></td><td><b>B2Bpm</b></td><td><b>" +
      i18n.blocks +
      "</b></td><td><b>APM</b></td><td><b>SPM</b></td><td><b>PPS</b></td><td><b>" +
      i18n.ren +
      "</b></td><td><b>" +
      i18n.rep +
      "</b></td></tr>";
    for (_0x208177 = 0; _0x208177 < _0x36eabc; _0x208177++) {
      if (_0x4770a9[_0x208177].forfeit) {
        _0x36efba +=
          "<tr><td><b>-</b></td><td>" +
          this.getName(_0x4770a9[_0x208177].c) +
          "</td><td>" +
          _0x4770a9[_0x208177].w +
          "</td><td>&infin;</td><td>" +
          _0x4770a9[_0x208177].r +
          "</td><td>" +
          _0x4770a9[_0x208177].l +
          "</td>                    <td>" +
          _0x4770a9[_0x208177].B2B +
          "</td><td>-</td><td>-</td>                    <td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr>";
      } else {
        var _0x708f6a =
          Math.round(
            (_0x4770a9[_0x208177].l * 100) /
              (_0x4770a9[_0x208177].t / 60),
          ) / 100;
        var _0x446253 =
          Math.round(
            (_0x4770a9[_0x208177].a * 100) /
              (_0x4770a9[_0x208177].t / 60),
          ) / 100;
        var _0x3a7916 =
          Math.round(
            (_0x4770a9[_0x208177].p * 100) / _0x4770a9[_0x208177].t,
          ) / 100;
        var _0x511d51 =
          Math.round(
            (_0x4770a9[_0x208177].B2B * 100) /
              (_0x4770a9[_0x208177].t / 60),
          ) / 100;
        var _0x2e3a38 = "-";
        if (
          _0x4770a9[_0x208177].hasOwnProperty("rep") &&
          _0x4770a9[_0x208177].rep !== 0
        ) {
          _0x2e3a38 =
            '<a href="/replay/live/' +
            _0x4770a9[_0x208177].rep +
            '" target="_blank"><img height="16" src="' +
            CDN_URL("/res/play.png") +
            '"></a>';
        }
        _0x36efba +=
          "<tr><td><b>" +
          (_0x208177 + 1) +
          ".</b></td><td>" +
          this.getName(_0x4770a9[_0x208177].c) +
          "</td><td>" +
          _0x4770a9[_0x208177].w +
          "</td><td>" +
          _0x4770a9[_0x208177].t +
          "</td><td>" +
          _0x4770a9[_0x208177].r +
          "</td><td>" +
          _0x4770a9[_0x208177].l +
          "</td>                    <td>" +
          _0x4770a9[_0x208177].B2B +
          "</td><td>" +
          _0x511d51 +
          "</td><td>" +
          _0x4770a9[_0x208177].p +
          "</td>                    <td>" +
          _0x446253 +
          "</td><td>" +
          _0x708f6a +
          "</td><td>" +
          _0x3a7916 +
          "</td><td>" +
          _0x4770a9[_0x208177].mc +
          "</td><td>" +
          _0x2e3a38 +
          "</td></tr>";
      }
    }
    _0x36efba += "</table>";
    this.moreData.innerHTML = _0x36efba;
  } else {
    _0x36efba +=
      '<table class="tstripes" width="100%"><tr><td></td><td><b>' +
      i18n.name +
      "</b></td><td><b>" +
      i18n.wins +
      "</b></td><td><b>" +
      i18n.time +
      "</b></td><td><b>" +
      i18n.received +
      "</b></td><td><b>" +
      i18n.sent +
      "</b></td></tr>";
    for (var _0x208177 = 0; _0x208177 < _0x36eabc; _0x208177++) {
      if (_0x4770a9[_0x208177].forfeit) {
        _0x36efba +=
          "<tr><td><b>-</b></td><td>" +
          this.getName(_0x4770a9[_0x208177].c) +
          "</td><td>" +
          _0x4770a9[_0x208177].w +
          "</td><td>&infin;</td><td>" +
          _0x4770a9[_0x208177].r +
          "</td><td>" +
          _0x4770a9[_0x208177].l +
          "</td></tr>";
      } else {
        _0x36efba +=
          "<tr><td><b>" +
          (_0x208177 + 1) +
          ".</b></td><td>" +
          this.getName(_0x4770a9[_0x208177].c) +
          "</td><td>" +
          _0x4770a9[_0x208177].w +
          "</td><td>" +
          _0x4770a9[_0x208177].t +
          "</td><td>" +
          _0x4770a9[_0x208177].r +
          "</td><td>" +
          _0x4770a9[_0x208177].l +
          "</td></tr>";
      }
      let _0x41e2be = this.p.GS.cidSlots[_0x4770a9[_0x208177].c];
      if (_0x41e2be !== undefined) {
        this.p.GS.slots[_0x41e2be].stats.winCounter.textContent =
          _0x4770a9[_0x208177].w;
      }
    }
    _0x36efba += "</table>";
    this.resultsContent.innerHTML = _0x36efba;
    this.p.GS.resultsShown = true;
    this.p.GS.resizeElements();
  }
};
Live.prototype.displayTeamResults = function (_0x353e61) {
  this.resultsBox.style.display = "block";
  var _0x28381e;
  var _0x349bf0;
  var _0x3292e2 = "";
  var _0x5aab59 = _0x353e61.res;
  var _0x1ae157 = _0x5aab59.length;
  var _0x451ad7 = this;
  for (var _0x1be008 = 0; _0x1be008 < _0x1ae157; _0x1be008++) {
    _0x5aab59[_0x1be008].forfeit = _0x5aab59[_0x1be008].t < 0;
  }
  _0x353e61.teams.sort(function (_0x59ff83, _0x2ca4de) {
    return _0x59ff83.pl - _0x2ca4de.pl;
  });
  _0x3292e2 +=
    '<table width="100%"><tr><td></td><td><b>' +
    i18n.name +
    "</b></td><td><b>" +
    i18n.wins +
    "</b></td><td><b>" +
    i18n.time +
    "</b></td><td><b>" +
    i18n.received +
    "</b></td><td><b>" +
    i18n.sent +
    "</b></td></tr>";
  for (
    _0x1be008 = 0;
    _0x1be008 < _0x353e61.teams.length;
    _0x1be008++
  ) {
    _0x28381e = _0x353e61.teams[_0x1be008].team;
    _0x349bf0 = undefined;
    _0x349bf0 = _0x451ad7.p.GS.teamData[_0x28381e].name;
    _0x3292e2 +=
      "<tr class='spaceBefore'><td><b>" +
      (_0x1be008 + 1) +
      ".</b></td><td>" +
      ('<span class="teamResTag" style="background-color:' +
        _0x451ad7.p.GS.teamData[_0x28381e].color +
        ';">' +
        _0x349bf0 +
        "</span></td><td>") +
      _0x353e61.teams[_0x1be008].w +
      "</td><td>" +
      _0x353e61.teams[_0x1be008].t +
      "</td><td>" +
      _0x353e61.teams[_0x1be008].r +
      "</td><td>" +
      _0x353e61.teams[_0x1be008].l +
      "</td></tr>";
    var _0x152d64 = [];
    for (var _0x37bd24 = 0; _0x37bd24 < _0x1ae157; _0x37bd24++) {
      if (
        _0x5aab59[_0x37bd24].team === _0x353e61.teams[_0x1be008].team
      ) {
        _0x152d64.push(_0x5aab59[_0x37bd24]);
      }
    }
    _0x152d64.sort(function (_0x391abf, _0x194577) {
      var _0x310c9e =
        parseFloat(_0x194577.t) - parseFloat(_0x391abf.t);
      if (_0x310c9e === 0) {
        return _0x194577.l - _0x391abf.l;
      } else {
        return _0x310c9e;
      }
    });
    for (_0x37bd24 = 0; _0x37bd24 < _0x152d64.length; _0x37bd24++) {
      if (_0x152d64[_0x37bd24].forfeit) {
        _0x3292e2 +=
          "<tr><td><b></b></td><td>" +
          this.getName(_0x152d64[_0x37bd24].c) +
          "</td><td>" +
          _0x152d64[_0x37bd24].w +
          "</td><td>&infin;</td><td>" +
          _0x152d64[_0x37bd24].r +
          "</td><td>" +
          _0x152d64[_0x37bd24].l +
          "</td></tr>";
      } else {
        _0x3292e2 +=
          "<tr><td><b></b></td><td>" +
          this.getName(_0x152d64[_0x37bd24].c) +
          "</td><td>" +
          _0x152d64[_0x37bd24].w +
          "</td><td>" +
          _0x152d64[_0x37bd24].t +
          "</td><td>" +
          _0x152d64[_0x37bd24].r +
          "</td><td>" +
          _0x152d64[_0x37bd24].l +
          "</td></tr>";
      }
    }
  }
  _0x3292e2 += "</table>";
  this.resultsContent.innerHTML = _0x3292e2;
  this.p.GS.resultsShown = true;
  this.p.GS.resizeElements();
};
Live.prototype.resolveMention = function (_0x4ba798) {
  var _0x300532 = _0x4ba798.m.split(" ");
  var _0x49dfec = "@" + this.chatName;
  var _0x7dbdcb = false;
  for (var _0xe417da in _0x300532) {
    if (_0x300532[_0xe417da] === _0x49dfec) {
      _0x300532[_0xe417da] =
        '<span class="mention">' + _0x49dfec + "</span>";
      _0x7dbdcb = true;
      break;
    }
  }
  if (_0x7dbdcb) {
    return _0x300532.join(" ");
  } else {
    return _0x4ba798.m;
  }
};
Live.prototype.chatMajorWarning = function (
  _0x4257f1,
  _0x298858,
  _0x3802e5 = {
    closable: true,
  },
) {
  if (this.Friends.friendsOpened) {
    this.Friends.openFriends();
  }
  var _0x276296 = document.createElement("div");
  _0x276296.classList.add("warnBox");
  if (_0x298858 !== undefined) {
    _0x276296.classList.add(_0x298858);
  }
  _0x276296.innerHTML = _0x4257f1;
  if (_0x3802e5.closable) {
    var _0x5e2169 = document.createElement("a");
    _0x5e2169.innerHTML =
      '<img src="/res/darkClose.png" alt="CLOSE">';
    _0x5e2169.href = "javascript:void(0)";
    _0x5e2169.classList.add("warnClose");
    _0x5e2169.addEventListener("click", function (_0x31720f) {
      _0x31720f.target.parentNode.parentNode.remove();
    });
    _0x276296.appendChild(_0x5e2169);
  }
  this.showInChat("", _0x276296);
};
Live.prototype.getChatLineClassesFor = function (_0x52f2b4) {
  if (_0x52f2b4 === -5) {
    return ["infoChl"];
  } else {
    return null;
  }
};
Live.prototype.showInChat = function (
  _0x1d0576,
  _0x1854be,
  _0x5e78da,
) {
  var _0x2eadb0 =
    _0x1d0576 === "" ? "" : "<b>" + _0x1d0576 + "</b>: ";
  var _0x3bd225 = _0x1d0576 === "" ? "srv" : "";
  var _0xf51dee = document.createElement("div");
  _0xf51dee.classList.add("chl");
  if (_0x5e78da != null) {
    if (Array.isArray(_0x5e78da)) {
      for (
        var _0x23ab3f = 0;
        _0x23ab3f < _0x5e78da.length;
        _0x23ab3f++
      ) {
        _0xf51dee.classList.add(_0x5e78da[_0x23ab3f]);
      }
    } else if (typeof _0x5e78da == "string") {
      _0xf51dee.classList.add(_0x5e78da);
    }
  }
  if (_0x3bd225) {
    _0xf51dee.classList.add(_0x3bd225);
  }
  if (_0x1854be instanceof HTMLDivElement) {
    _0xf51dee.appendChild(_0x1854be);
  } else {
    _0xf51dee.innerHTML = _0x2eadb0 + _0x1854be;
  }
  this.chatBox.appendChild(_0xf51dee);
  this.clearOldChatIfNeeded();
  if (!this.Friends.friendsOpened) {
    this.scrollOnMessage();
  }
};
Live.prototype.scrollOnMessage = function (_0x1bf735) {
  if (this.chatAtBottom || _0x1bf735) {
    this.p.GS.scrollChatDown();
  } else if (this.scrollDownChatBtn) {
    this.scrollDownChatBtn.style.backgroundColor = "yellow";
  }
};
Live.prototype.clearOldChatIfNeeded = function () {
  ++this.msgCount;
  if (this.msgCount % 10 == 0 && this.chatBox.children.length > 120) {
    for (
      var _0x4ba2f2 = 0;
      _0x4ba2f2 < 10 && this.chatBox.firstChild;
      _0x4ba2f2++
    ) {
      this.chatBox.removeChild(this.chatBox.firstChild);
    }
  }
};
Live.prototype.showInLobbyChat = function (_0x1771e1) {
  var _0x465792;
  var _0x2ccd45 = "";
  if (_0x1771e1.hasOwnProperty("n")) {
    if (_0x1771e1.hasOwnProperty("d") && _0x1771e1.d === 1) {
      _0x465792 =
        '<b><a class="relUser" target="_blank" href="https://discord.gg/RcNFCZC"><img src="' +
        CDN_URL("/res/svg/disW.svg") +
        '"> ' +
        _0x1771e1.n +
        "</a>: </b>";
    } else {
      _0x465792 =
        '<b><a href="/u/' +
        _0x1771e1.n +
        '" target="_blank" class="ut">' +
        _0x1771e1.n +
        "</a>: </b>";
      if (_0x1771e1.n === "Jstris") {
        _0x465792 =
          '<b><a href="/about" target="_blank">' +
          _0x1771e1.n +
          "</a>: </b>";
      }
    }
  } else {
    _0x465792 =
      _0x1771e1.hasOwnProperty("cid") && _0x1771e1.cid < 0
        ? "<b>" + this.getName(_0x1771e1.cid) + ": </b>"
        : "";
    if (_0x1771e1.cid === -5) {
      _0x465792 = this.getName(_0x1771e1.cid);
      _0x2ccd45 += " infoChl";
    }
  }
  var _0x58a36f = _0x1771e1.m;
  this.chatBoxLobby.innerHTML =
    this.chatBoxLobby.innerHTML +
    "<div class='chl" +
    _0x2ccd45 +
    "'>" +
    _0x465792 +
    _0x58a36f +
    "</div>";
  this.chatArea.scrollTop = this.chatArea.scrollHeight;
};
Live.prototype.getGameSlot = function (
  _0x933a66,
  _0x16bab8,
  _0x53942e,
) {
  return (
    !!this.p.GS.getSlot(_0x933a66, _0x53942e) &&
    (this.players.push(_0x933a66),
    (this.rcS[_0x16bab8] = _0x933a66),
    true)
  );
};
Live.prototype.onMessage = function (_0x28e26d) {
  if (typeof _0x28e26d.data == "string") {
    if (this.port === "9002") {
      console.log("Text message received: " + _0x28e26d.data);
    }
    this.handleResponse(JSON.parse(_0x28e26d.data));
  } else {
    var _0x14f413;
    var _0x5c8153;
    var _0x383577;
    var _0x5e100c;
    var _0x5e54c0;
    var _0x53bbb7 = new Uint8Array(_0x28e26d.data);
    var _0x12e5dd = "";
    if (_0x53bbb7[0] === 1) {
      _0x5c8153 = _0x53bbb7[1];
      _0x383577 = _0x53bbb7[2];
      _0x5e54c0 = _0x53bbb7[3];
      _0x5e100c = _0x53bbb7.length;
      for (var _0x3f33e0 = 4; _0x3f33e0 < _0x5e100c; _0x3f33e0++) {
        if (
          (_0x515c64 = _0x53bbb7[_0x3f33e0].toString(2)).length < 8
        ) {
          var _0x3ac327 = 8 - _0x515c64.length;
          for (
            var _0x4cf699 = 0;
            _0x4cf699 < _0x3ac327;
            _0x4cf699++
          ) {
            _0x515c64 = "0" + _0x515c64;
          }
        }
        _0x12e5dd += _0x515c64;
      }
      _0x14f413 = this.parseBinaryMatrix(_0x12e5dd, _0x5e54c0);
      this.updateLiveMatrixViaSnapshot(
        _0x5c8153,
        _0x383577,
        _0x14f413,
      );
    } else if (_0x53bbb7[0] === 2) {
      _0x5c8153 = _0x53bbb7[1];
      _0x383577 = _0x53bbb7[2];
      _0x5e100c = _0x53bbb7.length;
      _0x14f413 = Array();
      var _0x2f41dc = Array();
      for (_0x3f33e0 = 3; _0x3f33e0 < _0x5e100c; _0x3f33e0++) {
        var _0x515c64 = _0x53bbb7[_0x3f33e0];
        _0x2f41dc.push(_0x515c64 & 15);
        _0x2f41dc.push((_0x515c64 & 240) >> 4);
        if (_0x2f41dc.length === 10) {
          _0x14f413.push(_0x2f41dc);
          _0x2f41dc = Array();
        }
      }
      this.updateLiveMatrixViaSnapshot(
        _0x5c8153,
        _0x383577,
        _0x14f413,
      );
    } else if (_0x53bbb7[0] === 4) {
      this.decodeActionsAndPlay(_0x53bbb7, true);
    } else if (_0x53bbb7[0] === 5) {
      this.decodeActionsAndPlay(_0x53bbb7, false);
    } else if (_0x53bbb7[0] === 6 || _0x53bbb7[0] === 7) {
      this.decodeReplay2Fragment(_0x53bbb7);
    } else if (_0x53bbb7[0] === 99) {
      this.safeSend(_0x28e26d.data);
      return;
    }
  }
};
Live.prototype.decodeActionsAndPlay = function (
  _0x115e67,
  _0x5996cc,
) {
  if (this.p.GS.extendedAvailable) {
    var _0x475770 = new Replay();
    var _0x1b0ac8 = new ReplayStream();
    var _0x316aca = [];
    _0x1b0ac8.data = _0x115e67;
    _0x1b0ac8.wordSize = 8;
    for (_0x1b0ac8.byte = 2; ; ) {
      var _0x4566ee = {
        t: _0x5996cc ? _0x1b0ac8.pullBits(12) : 0,
        a: _0x1b0ac8.pullBits(4),
      };
      if (_0x4566ee.t === null || _0x4566ee.a === null) {
        break;
      }
      if (_0x4566ee.a === _0x475770.Action.GARBAGE_ADD) {
        _0x4566ee.d = [_0x1b0ac8.pullBits(5), _0x1b0ac8.pullBits(4)];
      }
      if (_0x4566ee.a === _0x475770.Action.REDBAR_SET) {
        _0x4566ee.d = [_0x1b0ac8.pullBits(5)];
      }
      if (_0x4566ee.a === _0x475770.Action.ARR_MOVE) {
        _0x4566ee.d = [_0x1b0ac8.pullBits(1)];
      }
      if (_0x4566ee.a === _0x475770.Action.AUX) {
        _0x4566ee.aux = _0x1b0ac8.pullBits(4);
        if (_0x4566ee.aux !== _0x475770.AUX.AFK) {
          if (_0x4566ee.aux === _0x475770.AUX.BLOCK_SET) {
            _0x4566ee.d = [
              _0x1b0ac8.pullBits(1),
              _0x1b0ac8.pullBits(4),
            ];
          } else if (_0x4566ee.aux === _0x475770.AUX.MOVE_TO) {
            _0x4566ee.d = [
              _0x1b0ac8.pullBits(4) - 3,
              _0x1b0ac8.pullBits(5) - 12,
            ];
          } else if (_0x4566ee.aux === _0x475770.AUX.RANDOMIZER) {
            _0x4566ee.d = [
              _0x1b0ac8.pullBits(1),
              _0x1b0ac8.pullBits(5),
            ];
          } else if (_0x4566ee.aux === _0x475770.AUX.MATRIX_MOD) {
            _0x4566ee.d = [
              _0x1b0ac8.pullBits(4),
              _0x1b0ac8.pullBits(5),
            ];
          } else if (
            _0x4566ee.aux === _0x475770.AUX.WIDE_GARBAGE_ADD
          ) {
            _0x4566ee.d = [
              _0x1b0ac8.pullBits(5),
              _0x1b0ac8.pullBits(4),
              _0x1b0ac8.pullBits(3),
              _0x1b0ac8.pullBits(1),
            ];
          }
        }
      }
      _0x316aca.push(_0x4566ee);
    }
    var _0x4a85e7 = this.rcS[_0x115e67[1]];
    if (
      _0x4a85e7 in this.p.GS.cidSlots &&
      this.clients[_0x4a85e7].rep
    ) {
      this.clients[_0x4a85e7].rep.playLive(_0x316aca);
    }
  }
};
Live.prototype.updateLiveMatrixViaSnapshot = function (
  _0x23e956,
  _0x55f557,
  _0x19b929,
) {
  var _0x4c59c7 = this.rcS[_0x23e956];
  if (this.p.GS.cidSlots.hasOwnProperty(_0x4c59c7)) {
    if (this.xbufferEnabled) {
      this.xbuffer[_0x4c59c7] = [_0x19b929, _0x55f557];
    } else {
      this.p.updateLiveMatrix(
        this.p.GS.cidSlots[_0x4c59c7],
        _0x19b929,
        _0x55f557,
      );
    }
  }
};
Live.prototype.onClose = function (_0x358718) {
  this.p.Caption.hide(this.p.Caption.LOADING);
  this.connected = false;
  this.socket = null;
  var _0x2dd850 = document.querySelector(".modWindow");
  if (_0x2dd850) {
    _0x2dd850.remove();
  }
  let _0x3bf277 = true;
  if (_0x358718.code === 4001) {
    var _0x4443bb =
      "<span style='font-weight:normal'>" +
      i18n.connLimit +
      " (discord.gg/RcNFCZC).</span>";
    this.chatMajorWarning(_0x4443bb, "criticalErr", {
      closable: false,
    });
    this.chatMajorWarning(
      "<b>Disconnected</b> - " +
        i18n.RLreach +
        " (<em>" +
        _0x358718.reason +
        "</em>)",
      "dc",
    );
    this.p.connectStatusElement.innerHTML += " | " + _0x358718.reason;
    return;
  }
  if (_0x358718.code !== 4002) {
    if (_0x358718.code === 4003 || _0x358718.code === 4004) {
      this.conAttempts = 1000;
      this.chatArea.style.backgroundColor = "red";
      this.toggleMorePractice(true, true);
      showElem(this.p.practiceMenu);
      showElem(this.p.rInfoBox);
      if (_0x358718.code === 4003) {
        this.p.Settings.setBanArtifact(_0x358718.reason);
        this.chatMajorWarning(i18n.ban1, "criticalErr", {
          closable: false,
        });
        this.p.connectStatusElement.innerHTML +=
          " | " + _0x358718.reason + "PE";
      } else {
        this.chatMajorWarning(i18n.ban2, "criticalErr", {
          closable: false,
        });
        this.p.connectStatusElement.innerHTML += " | Account BANNED";
      }
      return;
    }
    if (_0x358718.code !== 4005) {
      if (_0x358718.code === 4006) {
        this.chatMajorWarning(
          "OLD VERSION - refresh to update your client!",
          "criticalErr",
        );
      } else {
        if (_0x358718.code === 4007 || _0x358718.code === 4008) {
          this.p.Caption.loading("Switching servers");
          this.conAttempts = 0;
          if (_0x358718.code === 4008) {
            this.lastDC = _0x358718.code;
          }
          if (this.p.debug) {
            this.chatMajorWarning("CHANGING SERVER", "criticalErr");
          }
          this.updateConnectionInfo();
          setTimeout(this.changeServer.bind(this), 50);
          return;
        }
        if (_0x358718.code === 1006 && this.joinRemote) {
          console.log("Server switch request with code 1006?");
          let _0x43c495 = this.p.timestamp() - this.joinRemote.ts;
          console.log(_0x43c495);
          console.log(this.joinRemote);
          if (_0x43c495 < 5000) {
            this.updateConnectionInfo();
            setTimeout(this.changeServer.bind(this), 50);
            return;
          }
        } else if (
          !this.wasConnected &&
          this.conAttempts == this.MAX_CONN_ATTEMPTS
        ) {
          if (this.tryPlayParam()) {
            _0x3bf277 = false;
          }
        }
      }
      if (
        this.cid === 0 &&
        this.conAttempts < this.MAX_CONN_ATTEMPTS
      ) {
        this.useProxy();
        this.connect();
        return;
      }
      if (this.cid === 0) {
        this.isProxy = false;
      }
      _0x4443bb =
        "<span class='wFirstLine'><span class='wTitle'>" +
        i18n.connLost.toUpperCase() +
        "</span></span>";
      _0x4443bb +=
        "<p>" +
        trans(i18n.ncGS, {
          refr:
            '<a href="javascript:location.reload(true);">' +
            i18n.refr +
            "</a>",
        }) +
        "</p>";
      this.chatMajorWarning(_0x4443bb, "dc");
      this.updateConnectionInfo();
      if (_0x3bf277) {
        if (this.p.play === false && this.p.lastSeen === null) {
          this.toggleMorePractice(true, true);
        }
        if (!this.p.play || !this.p.isPmode(true)) {
          showElem(this.p.practiceMenu);
          showElem(this.p.rInfoBox);
          hideElem(this.p.botMenu);
          hideElem(this.p.sprintInfo);
        }
      }
      this.p.GS.setup(8);
      this.p.Caption.hide();
      this.p.changeSkin(0);
    } else {
      alert("Authentication failure!");
    }
  } else {
    this.chatMajorWarning(i18n.idleDC, "dc");
  }
};
Live.prototype.useProxy = function () {
  if (this.tryProxy) {
    this.port = "";
    if (!this.isProxy) {
      this.server = this.server + "/ws/";
    }
    this.isProxy = true;
    console.log("1st connection attempt failed, reconnecting...");
  }
};
Live.prototype.changeServer = function () {
  let _0x29f3f7 = this.joinRemote.srvId;
  let _0x44ebf7 = this.joinRemote.sess;
  let _0x42695a = this.servers[_0x29f3f7];
  var _0x214a07 = _0x42695a.p.length > 1 ? ":" + _0x42695a.p : "";
  this.socket = new WebSocket(
    _0x42695a.s +
      "://" +
      _0x42695a.h +
      _0x214a07 +
      "?v=" +
      this.version +
      "&sess=" +
      _0x44ebf7,
  );
  this.socket.binaryType = "arraybuffer";
  var _0x2761cb = this;
  this.socket.onopen = function (_0x40aa8b) {
    if (_0x40aa8b.target.readyState === 1) {
      _0x2761cb.onOpen(_0x40aa8b);
    }
  };
  this.socket.onmessage = this.onMessage.bind(this);
  function _0x115412(_0xbf89a6) {
    if (_0x2761cb.conAttempts > 10) {
      _0x2761cb.onClose(_0xbf89a6);
    } else {
      setTimeout(function () {
        _0x2761cb.conAttempts++;
        _0x2761cb.changeServer();
      }, 1000);
    }
  }
  this.socket.onerror = function (_0x3144b7) {
    _0x3144b7.target.onclose = function () {};
    if (
      _0x3144b7.target.readyState === 0 ||
      _0x3144b7.target.readyState === 1
    ) {
      _0x3144b7.target.close();
    }
    _0x3144b7.code = 1006;
    _0x115412(_0x3144b7);
  };
  this.socket.onclose = function (_0x5c40e3) {
    if (_0x5c40e3.code === 1006) {
      _0x115412(_0x5c40e3);
    } else {
      _0x2761cb.onClose(_0x5c40e3);
    }
  };
};
Live.prototype.connect = function () {
  var _0x34ec44;
  ++this.conAttempts;
  var _0xf43a67 = "";
  var _0x21bd98 = this.getParameterByName("play") ? "&join=0" : "";
  var _0x4d8596 = this.getParameterByName("join");
  if (!_0x4d8596) {
    let _0x58a208 = this.getParameterByName("teamflow");
    if (_0x58a208 && _0x58a208.length == 36) {
      let _0x4d0ece = this.getParameterByName("pass");
      if (_0x4d0ece) {
        _0xf43a67 += "&pass=" + _0x4d0ece;
      }
      _0x4d8596 = "tf-" + _0x58a208;
    }
    let _0x5db6d5 = this.getParameterByName("bramble");
    if (_0x5db6d5 && _0x5db6d5.length == 36) {
      let _0x44f3ff = this.getParameterByName("pass");
      if (_0x44f3ff) {
        _0xf43a67 += "&pass=" + _0x44f3ff;
      }
      _0x4d8596 = "br-" + _0x5db6d5;
    }
    let _0x59f18a = this.getParameterByName("ext");
    if (_0x59f18a && _0x59f18a.length == 36) {
      let _0x13d516 = this.getParameterByName("pass");
      if (_0x13d516) {
        _0xf43a67 += "&pass=" + _0x13d516;
      }
      _0x4d8596 = "in-" + _0x59f18a;
    }
  }
  if (_0x4d8596 !== "") {
    _0x21bd98 = "&join=" + _0x4d8596;
  }
  var _0x272710 = this.authorized ? "" : "&guest=1";
  var _0x1df267 = this.authorized ? "" : "&gSess=" + this.sessX;
  var _0x4bd763 =
    this.authorized ||
    isNaN((_0x34ec44 = parseInt(this.p.Settings.getCookie("nick"))))
      ? ""
      : "&nt=" + _0x34ec44;
  var _0x520ba5 =
    this.p.Settings.getBanArtifact() !== null
      ? "&room=" + this.p.Settings.getBanArtifact()
      : "";
  if (window.WebSocket) {
    var _0x29da91 = this.port.length > 1 ? ":" + this.port : "";
    this.socket = new WebSocket(
      this.serverScheme +
        "://" +
        this.server +
        _0x29da91 +
        "?v=" +
        this.version +
        _0x21bd98 +
        _0x272710 +
        _0x4bd763 +
        _0x520ba5 +
        _0x1df267 +
        _0xf43a67,
    );
    this.socket.binaryType = "arraybuffer";
    this.socket.onopen = this.onOpen.bind(this);
    this.socket.onmessage = this.onMessage.bind(this);
    this.socket.onclose = this.onClose.bind(this);
    var _0x12d659 = this;
    this.connectionTimeout = setTimeout(function () {
      var _0x1fc596 = _0x12d659.socket;
      if (
        _0x1fc596 !== null &&
        _0x1fc596.readyState === 0 &&
        _0x12d659.conAttempts < 2
      ) {
        _0x1fc596.onclose = _0x1fc596.onmessage = function () {};
        _0x1fc596.onopen = function () {
          _0x1fc596.close();
        };
        _0x1fc596.close();
        _0x12d659.socket = _0x1fc596 = null;
        _0x12d659.useProxy();
        _0x12d659.connect();
      }
    }, 1500);
  } else {
    alert(
      "This browser does not support websockets, we can't connect you :(",
    );
  }
};
Live.prototype.parseBinaryMatrix = function (_0x1fb1b4, _0x561e80) {
  var _0x16bfec = Array();
  var _0x6631c3 = Array();
  var _0x292e68 = _0x1fb1b4.length;
  for (var _0x5c22e3 = 0; _0x5c22e3 < _0x292e68; _0x5c22e3++) {
    _0x6631c3.push(parseInt(_0x1fb1b4.charAt(_0x5c22e3)));
    if (_0x6631c3.length === 10) {
      if (!(_0x16bfec.length < 20 - _0x561e80)) {
        while (_0x561e80 > 0) {
          _0x16bfec.push([9, 9, 9, 9, 9, 9, 9, 9, 9, 9]);
          _0x561e80--;
        }
        break;
      }
      _0x16bfec.push(_0x6631c3);
      _0x6631c3 = Array();
    }
  }
  return _0x16bfec;
};
Live.prototype.sendReplayConfig = function () {
  var _0x5e4004 = {
    t: 23,
  };
  _0x5e4004.rc = this.rc;
  _0x5e4004.softDropId = this.p.Replay.config.softDropId;
  _0x5e4004.bs = this.p.Replay.config.bs;
  if (this.p.Replay.config.bbs) {
    _0x5e4004.bbs = this.p.Replay.config.bbs;
  }
  if (this.p.Replay.config.rnd) {
    _0x5e4004.rnd = this.p.Replay.config.rnd;
  }
  if (_0x5e4004.bs === 7) {
    _0x5e4004.mClr = this.p.Replay.config.mClr;
  }
  if (_0x5e4004.bs > 1000) {
    _0x5e4004.bp = this.p.Replay.config.bp;
  }
  var _0x5eac3d = JSON.stringify(_0x5e4004);
  this.safeSend(_0x5eac3d);
};
Live.prototype.sendRepFragment = function (_0x5d07ed, _0x469582) {
  var _0x517556 = new ReplayStream();
  _0x517556.wordSize = 8;
  var _0x7c82d0 = new Replay();
  _0x517556.pushBits(_0x469582 ? 4 : 5, 8);
  _0x517556.pushBits(this.rc, 8);
  var _0x15383e = _0x5d07ed.length;
  for (var _0x33ebce = 0; _0x33ebce < _0x15383e; _0x33ebce++) {
    var _0x4a7f94 = _0x5d07ed[_0x33ebce].t;
    if (_0x469582) {
      _0x517556.pushBits(_0x4a7f94 >>> 6, 6);
      _0x517556.pushBits(_0x4a7f94 & 63, 6);
    }
    _0x517556.pushBits(_0x5d07ed[_0x33ebce].a, 4);
    if (_0x7c82d0.AuxBits[_0x5d07ed[_0x33ebce].a] !== undefined) {
      var _0x11b7e2 = _0x7c82d0.AuxBits[_0x5d07ed[_0x33ebce].a];
      for (
        var _0x55029a = 0;
        _0x55029a < _0x11b7e2.length;
        _0x55029a++
      ) {
        _0x517556.pushBits(
          _0x5d07ed[_0x33ebce].d[_0x55029a],
          _0x11b7e2[_0x55029a],
        );
      }
      if (_0x5d07ed[_0x33ebce].a === _0x7c82d0.Action.AUX) {
        if (_0x5d07ed[_0x33ebce].d[0] !== _0x7c82d0.AUX.AFK) {
          if (_0x5d07ed[_0x33ebce].d[0] === _0x7c82d0.AUX.BLOCK_SET) {
            _0x517556.pushBits(_0x5d07ed[_0x33ebce].d[1], 1);
            _0x517556.pushBits(_0x5d07ed[_0x33ebce].d[2], 4);
          } else if (
            _0x5d07ed[_0x33ebce].d[0] === _0x7c82d0.AUX.MOVE_TO
          ) {
            _0x517556.pushBits(_0x5d07ed[_0x33ebce].d[1] + 3, 4);
            _0x517556.pushBits(_0x5d07ed[_0x33ebce].d[2] + 12, 5);
          } else if (
            _0x5d07ed[_0x33ebce].d[0] === _0x7c82d0.AUX.RANDOMIZER
          ) {
            _0x517556.pushBits(_0x5d07ed[_0x33ebce].d[1], 1);
            _0x517556.pushBits(_0x5d07ed[_0x33ebce].d[2], 5);
          } else if (
            _0x5d07ed[_0x33ebce].d[0] === _0x7c82d0.AUX.MATRIX_MOD
          ) {
            _0x517556.pushBits(_0x5d07ed[_0x33ebce].d[1], 4);
            _0x517556.pushBits(_0x5d07ed[_0x33ebce].d[2], 5);
          } else if (
            _0x5d07ed[_0x33ebce].d[0] ===
            _0x7c82d0.AUX.WIDE_GARBAGE_ADD
          ) {
            _0x517556.pushBits(_0x5d07ed[_0x33ebce].d[1], 5);
            _0x517556.pushBits(_0x5d07ed[_0x33ebce].d[2], 4);
            _0x517556.pushBits(_0x5d07ed[_0x33ebce].d[3], 3);
            _0x517556.pushBits(_0x5d07ed[_0x33ebce].d[4], 1);
          }
        }
      }
    }
  }
  if (!_0x469582) {
    if (8 - _0x517556.bitpos >= 4) {
      _0x517556.pushBits(_0x7c82d0.Action.AUX, 4);
    }
  }
  var _0x53f457 = new Uint8Array(_0x517556.data);
  this.safeSend(_0x53f457.buffer);
};
Live.prototype.sendReplay2Fragment = function (_0x633941, _0x2bd41f) {
  var _0x64297f = _0x2bd41f ? 6 : 7;
  var _0x2405d1 = new Uint8Array(2 + _0x633941.length);
  _0x2405d1[0] = _0x64297f;
  _0x2405d1[1] = this.rc;
  _0x2405d1.set(_0x633941, 2);
  this.safeSend(_0x2405d1.buffer);
};
Live.prototype.decodeReplay2Fragment = function (_0xc7b2) {
  if (this.p.GS.extendedAvailable) {
    var _0x18692a = _0xc7b2[1];
    var _0x5f4aa1 = this.rcS[_0x18692a];
    if (
      _0x5f4aa1 &&
      this.clients[_0x5f4aa1] &&
      this.clients[_0x5f4aa1].rep
    ) {
      if (!this.clients[_0x5f4aa1].replay2Dec) {
        this.clients[_0x5f4aa1].replay2Dec = new Replay2Decoder();
      }
      var _0x41ac29 = _0xc7b2.slice(2);
      var _0x4d76c5 =
        this.clients[_0x5f4aa1].replay2Dec.decodeFragment(_0x41ac29);
      if (_0x4d76c5.length > 0) {
        this.clients[_0x5f4aa1].rep.playLiveReplay2(_0x4d76c5);
      }
    }
  }
};
Live.prototype.sendSnapshot = function (_0x4f8416) {
  if (this.connected === true && !this.p.isPmode(true)) {
    var _0x4ba08d;
    var _0x486a09 = new ArrayBuffer(103);
    (_0x4ba08d = new Uint8Array(_0x486a09))[0] = 2;
    _0x4ba08d[1] = this.rc;
    _0x4ba08d[2] = this.p.redBar;
    var _0x1ed095 = 0;
    var _0x45d7fa = 3;
    var _0x3e675c = 0;
    for (var _0x54cf90 = 0; _0x54cf90 < 20; _0x54cf90++) {
      for (var _0x4d80bf = 0; _0x4d80bf < 10; _0x4d80bf++) {
        _0x3e675c |=
          (_0x4f8416[_0x54cf90][_0x4d80bf] & 15) << (_0x1ed095++ * 4);
        if (_0x1ed095 == 2) {
          _0x4ba08d[_0x45d7fa] = _0x3e675c;
          _0x3e675c = 0;
          _0x1ed095 = 0;
          _0x45d7fa++;
        }
      }
    }
    this.safeSend(_0x486a09);
  }
};
Live.prototype.safeSend = function (_0x4783bd) {
  return (
    !!this.socket &&
    this.socket.readyState === this.socket.OPEN &&
    (this.socket.send(_0x4783bd), true)
  );
};
Live.prototype.sendStats = function () {
  if (!this.statsSent) {
    if (this.p.livePmode !== 9) {
      var _0x590ff2 = {
        pcs: this.p.placedBlocks,
        apm: this.p.getAPM(),
        mc: this.p.gamedata.maxCombo,
        B2B: this.p.gamedata.B2B,
        a: this.p.gamedata.attack,
      };
      this.p.Replay.config.gameEnd = this.p.timestamp();
      var _0xbbba87 = this.p.Replay.getData().substr(0, 5);
      var _0x564b28 = JSON.stringify({
        t: 14,
        gid: this.roundSeed,
        d: _0x590ff2,
        rep: _0xbbba87,
      });
      this.safeSend(_0x564b28);
      this.statsSent = true;
    } else {
      this.statsSent = true;
    }
  }
};
Live.prototype.sendRestartEvent = function () {
  if (this.p.Bots && this.p.Bots.mode == 1) {
    this.p.Bots.newGame();
  } else {
    this.safeSend('{"t":5}');
    this.p.focusState = 0;
    this.p.canvas.focus();
    if (typeof ga == "function") {
      ga("send", {
        hitType: "event",
        eventCategory: "Game",
        eventAction: "restart",
      });
    }
  }
};
Live.prototype.sendGameOverEvent = function () {
  this.safeSend('{"t":7}');
  if (!this.statsSent) {
    this.sendStats();
  }
  this.notPlaying.push(this.cid);
};
Live.prototype.showTargetOnSlot = function (_0x579587) {
  if (!(_0x579587 >= 0)) {
    _0x579587 = -1;
  }
  this.p.GS.setTarget(_0x579587);
};
Live.prototype.hideResults = function () {
  this.resultsBox.style.display = "none";
  this.resultsContent.textContent = "";
  this.p.GS.resultsShown = false;
  this.p.GS.resizeElements();
};
Live.prototype.beforeReset = function () {
  if (!this.p.isTabFocused) {
    if (
      this.p.Settings.gameStartNotif &&
      typeof Notification != "undefined" &&
      Notification.permission === "granted"
    ) {
      var _0x48b0b7 = new Notification("⚠ New game starting! ⚠", {
        icon: "/res/logo.png",
      });
      _0x48b0b7.onclick = function () {
        window.focus();
        _0x48b0b7.close();
      };
    }
    var _0x2cad8d = document.getElementById("favicon");
    var _0x4ba538 = this.p;
    var _0x567c5f = document.title;
    var _0x34fb79 = 0;
    var _0x3527fe = setInterval(function () {
      ++_0x34fb79;
      _0x2cad8d.href =
        "/res/favicon" + (_0x34fb79 % 2 == 0 ? "2" : "") + ".ico";
      document.title =
        _0x34fb79 % 10 > 7 ? _0x567c5f : "⚠ New game starting! ⚠";
      if (_0x34fb79 === 101 || _0x4ba538.isTabFocused) {
        clearInterval(_0x3527fe);
        document.title = _0x567c5f;
        _0x2cad8d.href = "/res/favicon.ico";
      }
    }, 100);
  }
};
Live.prototype.onReset = function () {
  this.winnerCID = undefined;
  this.places = {};
  this.p.GS.reset();
  this.hideResults();
  this.changeTarget();
};
Live.prototype.changeTarget = function () {
  if (this.sitout || this.liveMode == 1 || this.gdm !== 0) {
    return false;
  }
  var _0x3e7528 = [];
  var _0x205261 = 0;
  var _0x4b144d = this.players.length;
  for (var _0x2fc5b5 = 0; _0x2fc5b5 < this.bots.length; _0x2fc5b5++) {
    if (
      arrayContains(this.notPlaying, this.bots[_0x2fc5b5]) === false
    ) {
      _0x3e7528.push(this.bots[_0x2fc5b5]);
    }
  }
  for (_0x2fc5b5 = 0; _0x2fc5b5 < _0x4b144d; _0x2fc5b5++) {
    if (
      arrayContains(this.notPlaying, this.players[_0x2fc5b5]) ===
        false &&
      arrayContains(this.bots, this.players[_0x2fc5b5]) === false
    ) {
      _0x3e7528.push(this.players[_0x2fc5b5]);
    }
  }
  if (_0x3e7528.length > 0) {
    var _0x3ae13f = _0x3e7528.indexOf(this.currentTarget);
    if (_0x3ae13f == -1) {
      _0x3ae13f = 0;
    }
    _0x205261 =
      _0x3e7528[_0x3ae13f + 1] !== undefined
        ? _0x3e7528[_0x3ae13f + 1]
        : _0x3e7528[0];
    this.currentTarget = _0x205261;
  } else {
    this.currentTarget = 0;
  }
  this.showTargetOnSlot(this.p.GS.cidSlots[_0x205261]);
};
Live.prototype.sendAttack = function (
  _0x58b669,
  _0x24d79f,
  _0x4a3ded,
) {
  if (this.p.Bots && this.p.Bots.mode == 1) {
    this.p.Bots.attackFromPlayerToBot(_0x58b669, _0x24d79f);
  }
  if (this.gdm !== 0 || this.currentTarget !== 0) {
    var _0x3e1036 = parseInt(this.currentTarget);
    var _0x507716 = this.gdm === 0 ? 11 : 7;
    var _0x4d0985 = new Uint8Array(_0x507716);
    _0x4d0985[0] = 13;
    _0x4d0985[1] = !_0x58b669 || _0x58b669 > 255 ? 0 : _0x58b669;
    _0x4d0985[2] = _0x4a3ded.type | (_0x4a3ded.b2b ? 128 : 0);
    _0x4d0985[3] = !_0x24d79f || _0x24d79f > 255 ? 0 : _0x24d79f;
    _0x4d0985[4] = _0x4a3ded.cmb;
    _0x4d0985[5] = (this.gid & 65280) >> 8;
    _0x4d0985[6] = (this.gid & 255) >> 0;
    if (this.gdm === 0) {
      _0x4d0985[7] = (_0x3e1036 & -16777216) >> 24;
      _0x4d0985[8] = (_0x3e1036 & 16711680) >> 16;
      _0x4d0985[9] = (_0x3e1036 & 65280) >> 8;
      _0x4d0985[10] = (_0x3e1036 & 255) >> 0;
    }
    this.safeSend(_0x4d0985.buffer);
  }
};
Live.prototype.sendAttackOld = function (_0x4f099b) {
  if (this.gdm !== 0 || this.currentTarget !== 0) {
    var _0x36ffe4 =
      '{"t":13, "a":' +
      _0x4f099b +
      ', "cid":' +
      parseInt(this.currentTarget) +
      ', "g":' +
      this.gid +
      "}";
    this.safeSend(_0x36ffe4);
  }
};
Live.prototype.sendAttackToSlot = function (_0x431e50, _0x1acbf3) {
  var _0x7c4abe =
    '{"t":13, "a":' +
    _0x1acbf3 +
    ', "cid":' +
    this.p.GS.slots[_0x431e50].cid +
    ', "g":' +
    this.gid +
    "}";
  this.safeSend(_0x7c4abe);
};
Live.prototype.setChatName = function (_0x2837b6) {
  if (!this.authorized) {
    var _0x22d78e = _0x2837b6.substr(0, 15);
    this.chatName = stringEscape(_0x22d78e);
  }
  this.clients[this.cid].name = this.chatName;
  this.chatInput.placeholder = "";
  this.showInChat(
    "",
    "<em>" + i18n.welcome + " " + this.chatName + "!</em>",
  );
  this.showInChat("", "<em>" + i18n.typeHelp + "</em>");
};
Live.prototype.spectatorMode = function (_0x3700f4) {
  if (arguments.length === 0) {
    _0x3700f4 = 0;
  }
  if (this.p.Bots && this.p.Bots.mode == 1) {
    _0x3700f4 = 1;
  }
  if (_0x3700f4 !== 1) {
    this.safeSend('{"t":16, "mode":0}');
  }
  if (_0x3700f4 !== 2) {
    this.showInChat("", "<em>" + i18n.specModeInfo + "</em>");
  }
  this.sitout = true;
  this.umLoadingPhase = false;
  this.setResetButton(true);
  let _0x2c79c4 = this.p.SEenabled;
  this.p.starting = false;
  this.p.SEenabled = false;
  this.p.GameOver();
  this.p.SEenabled = _0x2c79c4;
  this.statsSent = true;
  this.p.v.clearHoldCanvas();
  this.p.v.clearQueueCanvas();
  this.p.clearMatrix();
  this.p.redBar = 0;
  this.p.activeBlock.pos.y = 30;
  this.p.focusState = 0;
  this.p.redraw();
  this.p.Caption.hide();
  this.p.Caption.spectatorMode();
  hideElem(this.teamOptions);
};
Live.prototype.spectatorModeOff = function (_0x306fa4) {
  if (arguments.length === 0) {
    _0x306fa4 = 0;
  }
  if (this.p.Bots && this.p.Bots.mode == 1) {
    _0x306fa4 = 1;
  }
  if (_0x306fa4 === 0) {
    this.safeSend('{"t":16, "mode":0}');
  }
  if (this.p.GS.isFullscreen) {
    this.p.GS.fullScreen(false);
  }
  this.sitout = false;
  this.setResetButton(false);
  this.showInChat("", "<em>You left the spectator mode.</em>");
  this.p.Caption.hide();
};
Live.prototype.onGameEnd = function () {
  hideElem(this.p.sprintInfo);
  hideElem(this.p.teamInfo);
  showElem(this.p.rInfoBox);
  if (this.p.Bots && this.p.Bots.mode == 1) {
    showElem(this.p.botMenu);
    hideElem(this.p.practiceMenu);
  } else {
    showElem(this.p.practiceMenu);
    hideElem(this.p.botMenu);
  }
  if (this.liveMode === 2) {
    showElem(this.teamOptions);
  }
};
Live.prototype.onReplaySaved = function (_0xa0d76d) {
  if (_0xa0d76d.rep) {
    this.replayInfoToChat(_0xa0d76d.id, _0xa0d76d.gm, _0xa0d76d.m);
  }
  if (_0xa0d76d.pb && !this.p.play && !this.p.starting) {
    if (typeof _0xa0d76d.pb == "object") {
      let _0x2e1f81 = this.p.RulesetManager.fullModeName(
        _0xa0d76d.gm,
        _0xa0d76d.m,
      );
      _0xa0d76d.pb.modeTitle =
        _0x2e1f81.replace(/ /g, "&nbsp;") +
        " by&nbsp;" +
        this.chatName;
    }
    this.p.Caption.newPB(_0xa0d76d.pb);
  }
};
Live.prototype.setResetButton = function (_0x212b19) {
  if (this.hostStartMode || (this.p.Bots && this.p.Bots.mode == 1)) {
    this.resetButton.disabled = false;
  } else {
    this.resetButton.disabled = _0x212b19;
  }
};
Live.prototype.replayInfoToChat = function (
  _0x2988d5,
  _0x46ea7e,
  _0x5a8521,
) {
  if (this.authorized) {
    var _0x9b9fc0 =
      this.getLeaderboardLink(_0x46ea7e, _0x5a8521) +
      "&display=4&id=" +
      _0x2988d5;
    var _0x2fb02b = _0x46ea7e === 5 ? "my scores" : "my times";
    if (_0x46ea7e === 7) {
      _0x2fb02b = "my TSD games";
    } else if (_0x46ea7e === 8) {
      _0x2fb02b = "my PC games";
    }
    this.showInChat(
      "",
      i18n.replay +
        ': <a target="_blank" href="/replay/' +
        _0x2988d5 +
        '">/replay/' +
        _0x2988d5 +
        '</a>. View in <a href="' +
        _0x9b9fc0 +
        '" target="_blank">' +
        _0x2fb02b +
        "</a>.",
    );
  } else {
    this.showInChat(
      "",
      i18n.replayAvailable +
        ': <a target="_blank" href="/guest-replay/' +
        _0x2988d5 +
        '">/guest-replay/' +
        _0x2988d5 +
        "</a>.",
    );
  }
};
Live.prototype.getLeaderboardLink = function (_0x234066, _0x560fc1) {
  var _0x1e9063 = "";
  var _0x53a0fd = "";
  if (_0x560fc1 >= 10 && _0x234066 != 6) {
    var _0x42a64a = Math.floor(_0x560fc1 / 10);
    var _0x2e39dd = this.p.RulesetManager.RULESETS[_0x42a64a];
    if (_0x42a64a !== 0 && _0x2e39dd) {
      _0x53a0fd = "&rule=" + _0x2e39dd.key;
      _0x560fc1 %= 10;
    } else {
      _0x53a0fd = "";
    }
  }
  switch (_0x234066) {
    case 1:
      _0x1e9063 =
        "/sprint?lines=" + (this.p.sprintModes[_0x560fc1] + "L");
      break;
    case 3:
      _0x1e9063 =
        "/cheese?lines=" + (this.p.cheeseModes[_0x560fc1] + "L");
      break;
    case 4:
      _0x1e9063 = "/survival?lines=" + (["1+g%2Fs"][_0x560fc1] + "L");
      break;
    case 5:
      _0x1e9063 = "/ultra?lines=2+minutes";
      break;
    case 6:
      _0x1e9063 = "/map/" + _0x560fc1 + "?ref=game";
      break;
    case 7:
      _0x1e9063 = "/20TSD?ref=game";
      break;
    case 8:
      _0x1e9063 = "/PC-mode?ref=game";
  }
  return (_0x1e9063 += _0x53a0fd);
};
Live.prototype.sendPracticeModeStarting = function () {
  if (this.socket) {
    var _0x4f1299 = new Object();
    _0x4f1299.t = 22;
    _0x4f1299.s = this.p.Replay.config.seed;
    this.safeSend(JSON.stringify(_0x4f1299));
  }
};
Live.prototype.sendUsermodeReady = function () {
  if (this.socket) {
    this.safeSend(
      JSON.stringify({
        t: 36,
      }),
    );
  }
};
Live.prototype.sendGameModeResult = function (_0x3b692c) {
  if (_0x3b692c.mode !== -1) {
    var _0x1738bd = _0x3b692c.getGameTime();
    var _0x3f3a08 = _0x3b692c.getData();
    var _0x1f0931 = sprintTimeFormat(_0x1738bd, 3);
    var _0x4f30bb = "";
    var _0x4a93c9 = "";
    if (
      _0x3b692c.config.r === 0 &&
      this.p.pmode === 1 &&
      ((this.p.sprintMode === 1 &&
        this.p.gamedata.TSD === 20 &&
        this.p.gamedata.lines === 40) ||
        (this.p.sprintMode === 2 &&
          this.p.gamedata.TSD === 10 &&
          this.p.gamedata.lines === 20))
    ) {
      _0x3b692c.config.m = 458753;
      this.p.pmode = 7;
      this.p.sprintMode = 1;
      if (this.p.gamedata.TSD === 20) {
        this.p.gamedata.TSD20 = Math.round(_0x1738bd * 1000);
      }
      _0x3f3a08 = _0x3b692c.getData();
    }
    if (_0x3b692c.config.r > 0) {
      let _0x2d13cd =
        this.p.RulesetManager.RULESETS[_0x3b692c.config.r];
      _0x4f30bb = "&rule=" + _0x2d13cd.key;
      if (_0x2d13cd.name) {
        _0x4a93c9 = _0x2d13cd.name + " ";
      }
    }
    var _0x2f69e3 = new Object();
    if (this.p.pmode === 1) {
      var _0x5c8863 = this.p.sprintModes[this.p.sprintMode] + "L";
      this.showInChat(
        "",
        i18n.sprint +
          " " +
          i18n.gameTime +
          ": <b>" +
          _0x1f0931 +
          " s</b>. " +
          i18n.see +
          " <a href='/sprint?lines=" +
          _0x5c8863 +
          _0x4f30bb +
          "' target='_blank'>" +
          _0x4a93c9 +
          _0x5c8863 +
          " " +
          i18n.leaderboard +
          "</a>.",
      );
    } else if (this.p.pmode === 3) {
      _0x5c8863 = this.p.cheeseModes[this.p.sprintMode] + "L";
      this.showInChat(
        "",
        i18n.cheese +
          " " +
          i18n.gameTime +
          ": <b>" +
          _0x1f0931 +
          " s</b>. " +
          i18n.see +
          " <a href='/cheese?lines=" +
          _0x5c8863 +
          _0x4f30bb +
          "' target='_blank'>" +
          _0x4a93c9 +
          _0x5c8863 +
          " " +
          i18n.leaderboard +
          "</a>.",
      );
    } else if (this.p.pmode === 4) {
      if (_0x4f30bb) {
        _0x4f30bb = "?" + _0x4f30bb.substr(1);
      }
      _0x1738bd = _0x3b692c.getGameTime(false);
      this.showInChat(
        "",
        i18n.survival +
          " " +
          i18n.gameTime +
          ": <b>" +
          _0x1f0931 +
          " s</b>. " +
          i18n.see +
          " <a href='/survival" +
          _0x4f30bb +
          "' target='_blank'>" +
          _0x4a93c9 +
          i18n.leaderboard +
          "</a>.",
      );
    } else if (this.p.pmode === 5) {
      if (_0x4f30bb) {
        _0x4f30bb = "?" + _0x4f30bb.substr(1);
      }
      _0x2f69e3.pts = this.p.gamedata.score;
      this.showInChat(
        "",
        i18n.ultra +
          " Score: <b>" +
          this.p.gamedata.score +
          "</b>. " +
          i18n.see +
          " <a href='/ultra" +
          _0x4f30bb +
          "' target='_blank'>" +
          _0x4a93c9 +
          i18n.leaderboard +
          "</a>.",
      );
    } else if (this.p.pmode === 6) {
      var _0x5d46e2 = this.p.MapManager.mapData.name;
      this.showInChat(
        "",
        '<b>"' +
          _0x5d46e2 +
          '"</b> map ' +
          i18n.gameTime +
          ": <b>" +
          _0x1f0931 +
          " s</b>. " +
          i18n.see +
          " <a href='/map/" +
          this.p.MapManager.mapId +
          "' target='_blank'>the map " +
          i18n.leaderboard +
          "</a>.",
      );
      if (
        this.p.MapManager.mapData.state !==
        this.p.MapManager.STATE_PUBLISHED
      ) {
        this.showInChat("", i18n.nsUnpub);
        return;
      }
    } else if (this.p.pmode === 7) {
      if (_0x4f30bb) {
        _0x4f30bb = "?" + _0x4f30bb.substr(1);
      }
      _0x2f69e3.pts = this.p.gamedata.TSD;
      _0x2f69e3.t20 = this.p.gamedata.TSD20;
      this.showInChat(
        "",
        "20TSD Result: <b>" +
          this.p.gamedata.TSD +
          " TSDs, " +
          _0x1f0931 +
          " s</b>. " +
          i18n.see +
          " <a href='/20TSD" +
          _0x4f30bb +
          "' target='_blank'>" +
          _0x4a93c9 +
          i18n.leaderboard +
          "</a>.",
      );
      if (this.p.gamedata.TSD < 1) {
        this.showInChat("", i18n.nsTspins);
        return;
      }
    } else if (
      this.p.pmode === 8 &&
      ((_0x4f30bb &&= "?" + _0x4f30bb.substr(1)),
      (_0x2f69e3.pts = this.p.gamedata.PCs),
      (this.p.placedBlocks -= this.p.PCdata.blocks),
      _0x2f69e3.pts > 0 &&
        ((_0x2f69e3.tt = _0x1738bd),
        (_0x1738bd = this.p.gamedata.lastPC),
        (_0x1f0931 = sprintTimeFormat(_0x1738bd, 3))),
      this.showInChat(
        "",
        i18n.PCmode +
          " Result: <b>" +
          this.p.gamedata.PCs +
          " PCs, " +
          _0x1f0931 +
          " s</b>. " +
          i18n.see +
          " <a href='/PC-mode" +
          _0x4f30bb +
          "' target='_blank'>" +
          _0x4a93c9 +
          i18n.leaderboard +
          "</a>.",
      ),
      this.p.gamedata.PCs < 2)
    ) {
      this.showInChat("", i18n.nsLowPC);
      return;
    }
    _0x2f69e3.t = 17;
    _0x2f69e3.gm = this.p.pmode;
    _0x2f69e3.m = this.p.sprintMode;
    _0x2f69e3.time = _0x1738bd;
    _0x2f69e3.f = this.p.totalFinesse;
    _0x2f69e3.bl = this.p.placedBlocks;
    _0x2f69e3.s = _0x3b692c.config.seed;
    _0x2f69e3.r = _0x3b692c.config.r;
    if (_0x3b692c.config.err) {
      _0x2f69e3.err = _0x3b692c.config.err;
    }
    if (this.socket) {
      _0x2f69e3.rep = _0x3f3a08;
      this.safeSend(JSON.stringify(_0x2f69e3));
    } else {
      _0x3b692c.config.offline = _0x2f69e3;
      _0x2f69e3.rep = _0x3f3a08 = _0x3b692c.getData();
      this.p.Replay.uploadError(this, "OFFLINE");
    }
  }
};
Live.prototype.raceCompleted = function () {
  var _0xce327d = new Object();
  _0xce327d.t = 18;
  this.safeSend(JSON.stringify(_0xce327d));
};
Live.prototype.setXbuffer = function (_0xb84782, _0x1910fd) {
  if (_0xb84782 >= 1 && _0xb84782 <= 6) {
    this.p.xbuffMask = (Math.pow(2, _0xb84782) - 1) >>> 0;
    this.xbufferEnabled = true;
    if (_0x1910fd) {
      this.showInChat(
        "",
        "Xbuffer enabled at lvl" +
          _0xb84782 +
          " (fm:" +
          this.p.xbuffMask +
          ").",
      );
    }
  } else {
    this.xbufferEnabled = false;
    this.p.xbuffMask = 1;
    if (_0x1910fd) {
      this.showInChat("", "Xbuffer disabled.");
    }
  }
};
Live.prototype.shouldWait = function (_0x4118a2) {
  return (
    !!_0x4118a2.hasOwnProperty("w") &&
    (_0x4118a2.w === 0
      ? (this.setResetButton(false), true)
      : (this.sitout || this.setResetProgress(_0x4118a2.w),
        this.setResetButton(true),
        true))
  );
};
Live.prototype.setResetProgress = function (_0xbb8f8e) {
  this.resetProgress.style.width = "0%";
  this.resetProgress.style.transitionDuration = "0s";
  if (_0xbb8f8e > 0) {
    var _0x23e5d4 = this;
    setTimeout(function () {
      _0x23e5d4.resetProgress.style.width = "99.9%";
      _0x23e5d4.resetProgress.style.transitionDuration =
        _0xbb8f8e + "s";
    }, 10);
  }
};
Live.prototype.onChatScroll = function (_0x5bdd5d) {
  if (this.Friends.friendsOpened) {
    return;
  }
  let _0x32eeee = this.chatAtBottom;
  this.chatAtBottom =
    this.chatArea.scrollTop + this.chatArea.clientHeight >=
    this.chatArea.scrollHeight - 42;
  if (!this.chatAtBottom && _0x32eeee) {
    let _0x2a9c75 = document.createElement("button");
    this.scrollDownChatBtn = _0x2a9c75;
    _0x2a9c75.innerHTML = document.getElementById("tc-hd").innerHTML;
    _0x2a9c75.classList.add("chatScrolllBtn");
    var _0x43d505 = this;
    _0x2a9c75.addEventListener("click", function () {
      _0x43d505.chatAtBottom = true;
      _0x43d505.chatArea.scrollTop = _0x43d505.chatArea.scrollHeight;
    });
    this.chatArea.appendChild(_0x2a9c75);
  } else if (this.chatAtBottom && this.scrollDownChatBtn) {
    this.removeScrollButton();
  }
};
Live.prototype.removeScrollButton = function () {
  try {
    this.chatArea.removeChild(this.scrollDownChatBtn);
  } catch (_0x247d36) {}
  this.scrollDownChatBtn = null;
};
Live.prototype.sendChat = function (_0x4c6dcd) {
  var _0x116ad9 =
    typeof _0x4c6dcd != "string"
      ? this.chatInput.value.replace(/"/g, '\\"')
      : _0x4c6dcd;
  this.p.inactiveGamesCount = 0;
  if (
    this.authorized &&
    this.clients[this.cid] !== undefined &&
    this.clients[this.cid].name === "jez"
  ) {
    if (_0x116ad9.substring(0, 2) === ".a") {
      var _0x1d5cf9 = parseInt(
        _0x116ad9.substring(2, _0x116ad9.length),
      );
      _0x116ad9 = '/js - {"t":31,"a":' + _0x1d5cf9 + "}";
    } else if (_0x116ad9.substring(0, 2) === ".s") {
      _0x1d5cf9 = parseInt(_0x116ad9.substring(2, _0x116ad9.length));
      _0x116ad9 = '/js - {"t":31,"s":' + _0x1d5cf9 + "}";
    }
  }
  if (_0x116ad9.length > 0) {
    if (_0x116ad9 === "/clearCookies") {
      this.p.Settings.clearAllCookies();
      this.showInChat("", "<em>All saved settings cleared.</em>");
    } else if (
      _0x116ad9 === "/last" ||
      _0x116ad9 === "/result" ||
      _0x116ad9 === "/results" ||
      _0x116ad9 === "/stats"
    ) {
      if (this.lastGameId) {
        this.showInChat(
          "",
          i18n.lastGame +
            ' <a target="_blank" href="/games/' +
            this.lastGameId +
            '">/games/' +
            this.lastGameId +
            "</a>",
        );
      } else {
        this.showInChat("", "There is no last game to show.");
      }
    } else if (
      _0x116ad9 === "/sitout" ||
      _0x116ad9 === "/spectate" ||
      _0x116ad9 === "/spec"
    ) {
      if (this.sitout) {
        this.showInChat("", "<em>" + i18n.aSpec + "</em>");
      } else {
        this.spectatorMode();
      }
    } else if (_0x116ad9 === "/play") {
      if (this.sitout) {
        this.spectatorModeOff();
      } else {
        this.showInChat("", "<em>" + i18n.aPlay + "</em>");
      }
    } else if (
      _0x116ad9 === "/speclist" ||
      _0x116ad9 === "/watching" ||
      _0x116ad9 === "/spectators"
    ) {
      _0x4c6dcd = '{"t":16, "mode":1}';
      this.safeSend(_0x4c6dcd);
    } else if (_0x116ad9 === "/clear") {
      this.chatBox.textContent = "";
    } else if (_0x116ad9 === "/fps") {
      this.p.toggleStats(0);
    } else if (_0x116ad9 === "/realfps" || _0x116ad9 === "/fps2") {
      this.p.toggleStats(1);
    } else if (_0x116ad9 === "/debug") {
      this.showInChat("", "<em>Debug output activated.</em>");
      this.p.debug = true;
    } else if (_0x116ad9 === "/DAS") {
      this.p.DASdebug = !this.p.DASdebug;
      this.p.toggleStats(0);
      if (this.p.stats) {
        this.p.stats.showPanel(3);
      }
    } else if (_0x116ad9 === "/version") {
      this.showInChat("", this.version);
    } else if (
      _0x116ad9 === "/link" ||
      _0x116ad9 === "/url" ||
      _0x116ad9 === "/URL"
    ) {
      if (this.p.Bots && this.p.Bots.mode == 1) {
        this.showInChat(
          "",
          "Private bot room cannot be joined by others.",
        );
      } else {
        var _0x2d6e37 =
          "https://jstris.jezevec10.com/join/" + this.rid;
        this.showInChat(
          "",
          "<span class='joinLink' onClick='selectText(this)'>" +
            _0x2d6e37 +
            "</span>",
        );
      }
    } else if (_0x116ad9 === "/config") {
      var _0xca5913 = "<b>" + i18n.roomSettings + "</b><br>";
      this.p.conf[0];
      _0xca5913 +=
        i18n.attack +
        ": " +
        JSON.stringify(this.p.linesAttack).substr(1).slice(0, -1) +
        "<br>" +
        i18n.combo +
        ": " +
        JSON.stringify(this.p.comboAttack).substr(1).slice(0, -1) +
        "<br>" +
        i18n.solid +
        ": " +
        (this.solidAfter
          ? "On - " + this.solidAfter + " sec"
          : "Off") +
        "<br>" +
        i18n.clear +
        ": " +
        (this.p.R.clearDelay
          ? "On - " + this.p.R.clearDelay + " ms"
          : "Off") +
        "<br>" +
        i18n.mode +
        ": " +
        ["Standard", "Cheese", "Team", "LiveRace"][this.liveMode] +
        "<br>" +
        i18n.garbage +
        ": " +
        this.gdms[this.gdm] +
        "<br>" +
        i18n.garbageDelay +
        ": " +
        this.p.R.gDelay +
        " ms<br>" +
        i18n.messiness +
        ": " +
        this.p.R.mess +
        "%";
      this.showInChat("", _0xca5913);
    } else if (_0x116ad9.substring(0, 4) === "/cid") {
      this.showInChat(
        "",
        this.p.GS.slots[parseInt(_0x116ad9.split(" ")[1])].cid,
      );
    } else if (_0x116ad9 === "/ping") {
      _0x4c6dcd = '{"t":99}';
      this.pingSent = this.p.timestamp();
      this.safeSend(_0x4c6dcd);
    } else if (_0x116ad9 === "/dc") {
      this.socket.close();
    } else if (_0x116ad9 === "/clients") {
      for (var _0x3b906 in this.clients) {
        this.showInChat(_0x3b906, this.clients[_0x3b906].name);
      }
    } else if (_0x116ad9 === "/memory") {
      if (window.performance && window.performance.memory) {
        this.showInChat(
          "Memory",
          Math.round(
            (window.performance.memory.usedJSHeapSize * 1000) /
              1048576,
          ) /
            1000 +
            " MiB",
        );
      } else {
        this.showInChat("", "Available only in Chrome browser.");
      }
    } else if (_0x116ad9.substring(0, 5) === "/zoom") {
      this.p.GS.setZoom(parseInt(_0x116ad9.split(" ")[1]));
    } else if (_0x116ad9.substring(0, 6) === "/setup") {
      this.p.GS.setup(parseInt(_0x116ad9.split(" ")[1]));
    } else if (_0x116ad9.substring(0, 7) === "/tsetup") {
      this.p.GS.tsetup([
        parseInt(_0x116ad9.split(" ")[1]),
        parseInt(_0x116ad9.split(" ")[2]),
      ]);
    } else if (_0x116ad9 === "/fe") {
      this.p.GS.forceExtended = !this.p.GS.forceExtended;
      this.p.GS.autoScale();
    } else if (_0x116ad9 === "/fullscreen" || _0x116ad9 === "/fs") {
      this.p.GS.fullScreen(!this.p.GS.isFullscreen);
    } else if (
      _0x116ad9 === "/rescale" ||
      _0x116ad9 === "/autoscale"
    ) {
      this.p.GS.autoScale();
    } else if (_0x116ad9 === "/replay") {
      this.p.Replay.getData();
      this.p.Replay.uploadError(this, "REQUESTED_BY_USER");
      if (this.p.ModeManager) {
        this.p.ModeManager.showMostRecentReplay(this);
      }
    } else if (_0x116ad9 === "/host") {
      if (
        this.hasOwnProperty("roomHost") &&
        this.roomHost &&
        this.clients[this.roomHost]
      ) {
        this.showInChat(
          "",
          "Room host: " + this.clients[this.roomHost].name,
        );
      } else {
        this.showInChat("", "No room host is set.");
      }
    } else if (_0x116ad9.substring(0, 8) === "/xbuffer") {
      this.setXbuffer(parseInt(_0x116ad9.split(" ")[1]), true);
    } else if (this.socket) {
      if (this.Friends.isFriendChat()) {
        this.Friends.sendChat(_0x116ad9);
      } else {
        var _0x16db2f = {
          t: 6,
          m: _0x116ad9,
        };
        this.safeSend(JSON.stringify(_0x16db2f));
      }
    } else {
      this.showInChat(
        "",
        "You are offline! Only possible to use offline commands.",
      );
    }
  }
  this.chatInput.value = "";
};
Live.prototype.showOfflineWarning = function () {
  this.playingOfflineWarningShown = true;
  this.chatBox.textContent = "";
  this.showInChat(
    "<span style='color:yellow'>" + i18n.warning2 + "</span>",
    "You are playing offline!<br>Try reloading Jstris online, otherwise:",
  );
  this.showInChat(
    "",
    "&#8226; Your games won't be stored in the leaderboards.",
  );
  this.showInChat(
    "",
    "&#8226; Your replay won't be uploaded, but you can save it.",
  );
  this.showInChat(
    "",
    "&#8226; Your game version <b>" +
      this.version +
      "</b> might be outdated.",
  );
  this.showInChat(
    "",
    "&#8226; Multiplayer games and chat are unavailable.",
  );
};
Live.prototype.toggleMorePractice = function (_0x585a56, _0x342446) {
  _0x585a56 = _0x585a56 || false;
  _0x342446 = _0x342446 || false;
  let _0x15c32e =
    document.getElementById("practice-menu-big").style.display ===
    "block";
  if (_0x585a56) {
    _0x15c32e = !_0x342446;
  }
  document.getElementById("practice-menu-big").style.display =
    _0x15c32e ? "none" : "block";
  document.getElementById("more-practice").textContent = _0x15c32e
    ? i18n.showMore
    : i18n.showLess;
};
Live.prototype.getParameterByName = function (_0x357366) {
  _0x357366 = _0x357366.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var _0x55374e = new RegExp("[\\?&]" + _0x357366 + "=([^&#]*)").exec(
    location.search,
  );
  if (_0x55374e === null) {
    return "";
  } else {
    return decodeURIComponent(_0x55374e[1].replace(/\+/g, " "));
  }
};
Live.prototype.showClass = function (_0x4e004f, _0x1c39e5) {
  _0x1c39e5 = _0x1c39e5 === undefined || _0x1c39e5;
  var _0x3c5c55 = document.getElementsByClassName(_0x4e004f);
  for (var _0x85b476 = 0; _0x85b476 < _0x3c5c55.length; _0x85b476++) {
    _0x3c5c55[_0x85b476].style.display = _0x1c39e5
      ? "table-row"
      : "none";
  }
};
RoomInfo.prototype.onLobbyRefresh = function () {
  var _0xdd27c1 = Array.from(
    this.l.lobbyBox.getElementsByClassName("lobbyRow"),
  );
  for (let _0x501951 of _0xdd27c1) {
    _0x501951.addEventListener(
      "mouseenter",
      this.openRoomDetails.bind(this),
    );
    _0x501951.addEventListener(
      "mouseleave",
      this.closeRoomDetails.bind(this),
    );
  }
  this.roomDetails = {};
};
RoomInfo.prototype.onLobbyClosed = function () {
  if (this.roomDetailBox !== null) {
    this.roomDetailBox.parentElement.removeChild(this.roomDetailBox);
    this.roomDetailBox = null;
  }
  this.timeoutRoomDetail = null;
  this.rdParts = {};
  this.roomDetails = {};
};
RoomInfo.prototype.detailBoxEntered = function (_0x50853a) {
  if (this.timeoutRoomDetail) {
    clearTimeout(this.timeoutRoomDetail);
    this.timeoutRoomDetail = null;
  }
};
RoomInfo.prototype.detailBoxLeft = function (_0x1c771a) {
  hideElem(this.roomDetailBox);
  this.timeoutRoomDetail = null;
  if (this.timeoutRequestDetail) {
    clearTimeout(this.timeoutRequestDetail);
  }
};
RoomInfo.prototype.createElement = function (
  _0x29187a,
  _0x517669,
  _0x215e65,
) {
  var _0x375a5d = document.createElement(_0x29187a);
  for (var _0x4388d0 in _0x517669) {
    _0x375a5d.classList.add(_0x517669[_0x4388d0]);
  }
  if (_0x215e65) {
    _0x215e65.appendChild(_0x375a5d);
  }
  return _0x375a5d;
};
RoomInfo.prototype.requestRoomDetail = function (_0x24d333) {
  this.l.safeSend('{"t":28,"r":"' + _0x24d333 + '"}');
};
RoomInfo.prototype.acceptRoomDetail = function (_0x10fb24) {
  if (this.l.lobbyVisible) {
    this.roomDetails[_0x10fb24.r] = _0x10fb24;
    this.displayRoomDetail(_0x10fb24.r);
  }
};
RoomInfo.prototype.displayRoomDetail = function (_0x4694fb) {
  if (
    this.roomDetailBox.dataset.id === _0x4694fb &&
    this.roomDetailBox.style.display !== "none"
  ) {
    var _0x41d446 = this.roomDetails[_0x4694fb];
    hideElem(this.rdParts.spinner);
    this.displayPlayers(_0x41d446);
    this.displayConfig(_0x41d446);
    this.displayLimit(_0x41d446);
  }
};
RoomInfo.prototype.displayLimit = function (_0x1d7844) {
  if (_0x1d7844.l === null) {
    hideElem(this.rdParts.limit);
    return;
  }
  let _0xdffaa = this.rdParts.limit;
  let _0x1312a3 = _0x1d7844.l.r;
  let _0x29469c = _0x1d7844.l.l;
  let _0x2e6dfb = _0x1d7844.l.s || {};
  this.rdParts.limit.style.display = "flex";
  let _0x559131 = this.createElement("div", ["rdLimitInf"], null);
  if (_0x1312a3) {
    _0xdffaa.classList.add("rdOK");
    _0xdffaa.classList.remove("rdF");
    _0xdffaa.innerHTML = getSVG("s-unlocked", "dark", "lIcn");
    _0x559131.innerHTML = "<h1>" + i18n.joinPossible + "</h1>";
  } else {
    _0xdffaa.classList.add("rdF");
    _0xdffaa.classList.remove("rdOK");
    _0xdffaa.innerHTML = getSVG("s-locked", "dark", "lIcn");
    _0x559131.innerHTML = "<h1>" + i18n.notEligible + "</h1>";
  }
  let _0x4e5f17 = function (_0x3cf247) {
    let _0x443747 = _0x3cf247[0];
    let _0x51a3bf = _0x3cf247[1];
    if (!_0x443747) {
      _0x443747 = "0";
    }
    if (!_0x51a3bf) {
      _0x51a3bf = "&infin;";
    }
    return "⟨" + _0x443747 + "," + _0x51a3bf + "⟩";
  };
  let _0x2ec433 = function (_0x584f0b, _0xd62212) {
    let _0x1ddbcc = _0xd62212[0];
    let _0x4dd2e6 = _0xd62212[1];
    if (
      _0x584f0b &&
      ((!_0x1ddbcc && !_0x4dd2e6) ||
        (!_0x1ddbcc && _0x584f0b <= _0x4dd2e6) ||
        (!_0x4dd2e6 && _0x584f0b >= _0x1ddbcc) ||
        (_0x584f0b <= _0x4dd2e6 && _0x584f0b >= _0x1ddbcc))
    ) {
      return "✓";
    } else {
      return "✗";
    }
  };
  let _0x34087b = "<dl>";
  for (let _0x3789bc in _0x29469c) {
    _0x34087b +=
      "<dt>" +
      this.LIMIT_NAMES[_0x3789bc].n +
      ": " +
      _0x4e5f17(_0x29469c[_0x3789bc]) +
      "</dt>";
    _0xc59af4 = _0x2e6dfb[_0x3789bc];
    _0x5d3ec8 = this.LIMIT_NAMES[_0x3789bc].u;
    _0x34087b +=
      "<dd>" +
      (_0x2ec433(_0x2e6dfb[_0x3789bc], _0x29469c[_0x3789bc]) +
        " " +
        (_0xc59af4 ? _0xc59af4 + " " + _0x5d3ec8 : "None")) +
      "</dd>";
  }
  var _0xc59af4;
  var _0x5d3ec8;
  _0x34087b += "</dl>";
  _0x559131.innerHTML += _0x34087b;
  _0xdffaa.appendChild(_0x559131);
};
RoomInfo.prototype.displayConfig = function (_0x25dafa) {
  let _0x23dacb = 0;
  let _0x3badcd = this.rdParts.settingsContent;
  while (_0x3badcd.firstChild) {
    _0x3badcd.removeChild(_0x3badcd.firstChild);
  }
  for (let _0x34657b in _0x25dafa.s) {
    if (!(_0x34657b in this.CONF_NAMES)) {
      continue;
    }
    let _0x33a8f1 = typeof this.CONF_NAMES[_0x34657b] == "object";
    let _0x62ce0c = "";
    let _0x47f13e =
      "• " +
      (_0x33a8f1
        ? this.CONF_NAMES[_0x34657b].n
        : this.CONF_NAMES[_0x34657b]);
    if (typeof _0x25dafa.s[_0x34657b] == "boolean") {
      _0x62ce0c = this.ON_OFF[_0x25dafa.s[_0x34657b] + 0];
    } else if (Array.isArray(_0x25dafa.s[_0x34657b])) {
    } else {
      if (_0x33a8f1 && "v" in this.CONF_NAMES[_0x34657b]) {
        let _0xe0ed9a =
          this.CONF_NAMES[_0x34657b].v[_0x25dafa.s[_0x34657b]];
        if (_0xe0ed9a === null) {
          continue;
        }
        _0xe0ed9a = _0xe0ed9a || "?";
        _0x62ce0c = _0xe0ed9a;
      } else {
        _0x62ce0c = _0x25dafa.s[_0x34657b];
      }
      if (_0x33a8f1 && "u" in this.CONF_NAMES[_0x34657b]) {
        _0x62ce0c += this.CONF_NAMES[_0x34657b].u;
      }
    }
    if (_0x62ce0c) {
      _0x47f13e += ": <span class=confVal>" + _0x62ce0c + "</span>";
    }
    this.createElement("div", ["rdItem"], _0x3badcd).innerHTML =
      _0x47f13e;
    ++_0x23dacb;
  }
  if (_0x23dacb) {
    showElem(this.rdParts.settings);
  }
};
RoomInfo.prototype.displayPlayers = function (_0x35c774) {
  this.rdParts.content.style.display = "flex";
  var _0xe93fa7 = 0;
  for (
    var _0x23fa99 = 0;
    _0x23fa99 < _0x35c774.p.p.length;
    ++_0x23fa99
  ) {
    if (!_0x35c774.p.p[_0x23fa99].hasOwnProperty("ti")) {
      _0x35c774.p.p[_0x23fa99].ti = 0;
    }
  }
  _0x35c774.p.p.sort(function (_0x5ab2f7, _0x3314dd) {
    if (_0x5ab2f7.type && !_0x3314dd.type) {
      return -1;
    } else if (!_0x5ab2f7.type && _0x3314dd.type) {
      return 1;
    } else if (
      _0x5ab2f7.type &&
      _0x3314dd.type &&
      _0x5ab2f7.ti != _0x3314dd.ti
    ) {
      if (_0x5ab2f7.ti > _0x3314dd.ti) {
        return -1;
      } else {
        return 1;
      }
    } else {
      return _0x5ab2f7.n.localeCompare(_0x3314dd.n);
    }
  });
  var _0x4d5a24 = "";
  var _0x23ab2f = null;
  for (var _0x4b143a of _0x35c774.p.p) {
    if (_0x23ab2f !== null && _0x23ab2f === _0x4b143a.n) {
      continue;
    }
    let _0x25bec3 = _0x4b143a.type || 0;
    let _0x5cecfc = {
      color: _0x4b143a.col || null,
      icon: _0x4b143a.icn || null,
      bold: _0x4b143a.ti >= 2,
    };
    _0x4d5a24 += this.l.getAuthorizedNameLink(
      _0x4b143a.n,
      _0x25bec3,
      _0x5cecfc,
    );
    ++_0xe93fa7;
    _0x23ab2f = _0x4b143a.n;
    if (_0xe93fa7 >= 21) {
      break;
    }
  }
  if (_0x35c774.p.c > 21) {
    _0x4d5a24 +=
      "<span class=pInfo>+" +
      trans(i18n.cntMore, {
        cnt: _0x35c774.p.c - 21,
      }) +
      "</span>";
    ++_0xe93fa7;
  } else if (_0x35c774.p.g) {
    _0x4d5a24 +=
      "<span class=pInfo>+" +
      trans(i18n.cntGuests, {
        cnt: _0x35c774.p.g,
      }) +
      "</span>";
    ++_0xe93fa7;
  } else if (_0x35c774.p.c + _0x35c774.p.s === 0) {
    _0x4d5a24 += "<span class=pInfo>" + i18n.noPlayers + "</span>";
  }
  if (_0x35c774.p.s && _0xe93fa7 < 22) {
    _0x4d5a24 +=
      "<span class=pInfo>+" +
      trans(i18n.cntSpec, {
        cnt: _0x35c774.p.s,
      }) +
      "</span>";
    ++_0xe93fa7;
  }
  this.rdParts.content.innerHTML = _0x4d5a24;
};
RoomInfo.prototype.openRoomDetails = function (_0x5e7346) {
  var _0x509523;
  var _0x56a5fb = _0x5e7346.target.dataset.id;
  var _0x507a5c =
    _0x5e7346.target.firstElementChild.childNodes[0].nodeValue;
  if (this.roomDetailBox) {
    _0x509523 = this.roomDetailBox;
    showElem(this.roomDetailBox);
    this.detailBoxEntered();
  } else {
    _0x509523 = this.roomDetailBox = this.createElement(
      "div",
      ["rdW"],
      this.l.lobbyBox,
    );
    let _0x18e662 = (this.rdParts.detail = this.createElement(
      "div",
      ["roomDetail"],
      _0x509523,
    ));
    this.rdParts.title = this.createElement(
      "div",
      ["rdTitle"],
      _0x18e662,
    );
    this.rdParts.spinner = this.createElement(
      "div",
      ["rdSpinner"],
      _0x18e662,
    );
    this.rdParts.content = this.createElement(
      "div",
      ["rdContent"],
      _0x18e662,
    );
    this.rdParts.settings = this.createElement("div", [], _0x18e662);
    this.rdParts.settingsTitle = this.createElement(
      "div",
      ["rdTitle", "rdSub"],
      this.rdParts.settings,
    );
    this.rdParts.settingsContent = this.createElement(
      "div",
      ["rdContent", "rdConf"],
      this.rdParts.settings,
    );
    this.rdParts.limit = this.createElement(
      "div",
      ["rdLimit"],
      _0x509523,
    );
    this.rdParts.settingsTitle.innerHTML = i18n.stngsCustom;
    var _0x2fecfd = this.createElement(
      "img",
      [],
      this.rdParts.spinner,
    );
    _0x2fecfd.src = CDN_URL("/res/svg/spinWhite.svg");
    _0x2fecfd.style.width = "40px";
    _0x509523.addEventListener(
      "mouseenter",
      this.detailBoxEntered.bind(this),
    );
    _0x509523.addEventListener(
      "mouseleave",
      this.detailBoxLeft.bind(this),
    );
  }
  showElem(this.rdParts.spinner);
  hideElem(this.rdParts.content);
  hideElem(this.rdParts.settings);
  hideElem(this.rdParts.limit);
  _0x49b91d = this.l.lobbyBox;
  _0x32f9ca = _0x49b91d.getBoundingClientRect();
  let _0x15e317 = _0x5e7346.clientY - _0x32f9ca.top;
  var _0x49b91d;
  var _0x32f9ca;
  let _0x51bc0f = Math.min(
    255,
    Math.max(-15, _0x15e317 - _0x509523.clientHeight / 2),
  );
  _0x509523.style.top = _0x51bc0f + "px";
  _0x509523.dataset.id = _0x56a5fb;
  this.rdParts.title.innerHTML = _0x507a5c;
  if (this.timeoutRequestDetail) {
    clearTimeout(this.timeoutRequestDetail);
  }
  if (this.roomDetails[_0x56a5fb]) {
    this.displayRoomDetail(_0x56a5fb);
  } else {
    this.timeoutRequestDetail = setTimeout(
      this.requestRoomDetail.bind(this, _0x56a5fb),
      30,
    );
  }
};
RoomInfo.prototype.closeRoomDetails = function (_0x27725e) {
  if (this.roomDetailBox) {
    this.timeoutRoomDetail = setTimeout(
      this.detailBoxLeft.bind(this),
      200,
    );
  }
};
Settings.prototype.init = function () {
  this.applyDefaults();
  this.tryToLoadControlsFromCookie();
  this.cookiePrefOnly();
  this.clearRealCookies();
};
Settings.prototype.applyDefaults = function () {
  this.controls = [37, 39, 40, 32, 90, 38, 67, 65, 115, 113];
  this.soundEnabled = false;
  this.DMsound = true;
  this.ml = 37;
  this.mr = 39;
  this.sd = 40;
  this.hd = 32;
  this.rl = 90;
  this.rr = 38;
  this.hk = 67;
  this.dr = 65;
  this.DAS = 133;
  this.ARR = 10;
  this.touchControlsEnabled = false;
  this.touchControls = false;
  this.gridMode = 1;
  this.SFXsetID = 2;
  this.VSFXsetID = 2;
  this.restartSprintOnFF = false;
  this.rescaleNow = false;
  this.gameStartNotif = false;
  this.DAScancel = true;
  this.defaultMonochrome = "#5c5c5c";
  this.p.DASmethod = 1;
  this.shownStats = [
    345, 745, 745, 745, 745, 746, 745, 745, 745, 741, 69,
  ];
};
Settings.prototype.openSettings = function () {
  this.box.style.display = "block";
  for (
    var _0x107321 = 1;
    _0x107321 < this.inputBoxes.length;
    _0x107321++
  ) {
    this.inputBoxes[_0x107321].value = this.getKeyName(
      this.controls[_0x107321 - 1],
    );
  }
  this.settingBoxes[1].value = this.DAS;
  this.settingBoxes[2].value = this.ARR;
  this.touchEnabledBox.checked = this.touchControlsEnabled;
  this.soundEnabledBox.checked = this.soundEnabled;
  this.DMsoundBox.checked = this.DMsound;
  this.SEEnabledBox.checked = this.p.SEenabled;
  this.VSEEnabledBox.checked = this.p.VSEenabled;
  this.SEStartEnabledBox.checked = this.p.SEStartEnabled;
  this.SEFaultEnabledBox.checked = this.p.SEFaultEnabled;
  this.SErotateEnabledBox.checked = this.p.SErotate;
  document.getElementById("rescaleNow").checked = this.rescaleNow;
  document.getElementById("cancelDAS").checked = this.DAScancel;
  document.getElementById("dasMethod").checked =
    this.p.DASmethod === 0;
  document.getElementById("wGL").checked = this.p.v.NAME === "webGL";
  document.getElementById("sd" + this.p.softDropId).checked = true;
  document.getElementById("gr" + this.gridMode).checked = true;
  document.getElementById("ghost").checked = this.p.ghostEnabled;
  document.getElementById("sd" + this.p.softDropId).checked = true;
  document.getElementById("mLay").checked =
    this.p.Mobile && this.p.Mobile.isMobile;
  document.getElementById("gameStartNotif").checked =
    this.gameStartNotif;
  this.statGameModeSelect.value = 0;
  this.onStatGameModeChange();
  var _0x3a7b05 = this.p.monochromeSkin ? 7 : this.p.skinId;
  try {
    document.getElementById("bs" + _0x3a7b05).checked = true;
  } catch (_0x4e4b1b) {}
  this.sfxSelect.value = this.SFXsetID.toString();
  this.vsfxSelect.value = this.VSFXsetID.toString();
  this.volumeChange(Math.round(createjs.Sound.volume * 100));
  soundCredits({
    srcElement: this.sfxSelect,
    set: this.p.SFXset,
  });
  soundCredits({
    srcElement: this.vsfxSelect,
    set: this.p.VSFXset,
  });
  var _0x2ee1f4 = this.p.monochromeSkin
    ? this.p.monochromeSkin
    : this.defaultMonochrome;
  this.monoColorInp.value = this.monoColorInp.style.backgroundColor =
    _0x2ee1f4;
  this.monochromePicker.set(_0x2ee1f4);
  if (this.p.Live.sTier >= 2 && !this.skinsLoaded) {
    this.loadMoreSkins();
    hideElem(document.getElementById("mSkInf-s"));
  }
};
Settings.prototype.addSkins = function () {
  if (this.moreSkins === null) {
    return;
  }
  let _0x50facf = "";
  for (let _0x5d8e3c of this.moreSkins) {
    let _0x53440d = CDN_URL("/res/b/" + _0x5d8e3c.p + ".png");
    _0x50facf +=
      '<input type="radio" name="bSkin" data-p="' +
      _0x5d8e3c.p +
      '" value="' +
      _0x5d8e3c.i +
      '" id="bs' +
      _0x5d8e3c.i +
      '"><label for="bs' +
      _0x5d8e3c.i +
      '"> ';
    _0x50facf +=
      '<img height="20" src="' +
      _0x53440d +
      '"><span class="skinAuth">by ' +
      _0x5d8e3c.a +
      "</span></label><br>";
  }
  document.getElementById("moreSkins").innerHTML = _0x50facf;
  if (this.p.skinId >= 1000) {
    var _0x42ab82 = this.p.monochromeSkin ? 7 : this.p.skinId;
    try {
      document.getElementById("bs" + _0x42ab82).checked = true;
    } catch (_0x13990b) {}
  }
};
Settings.prototype.loadMoreSkins = function () {
  this.skinsLoaded = true;
  var _0xfb2d69 = new XMLHttpRequest();
  _0xfb2d69.timeout = 10000;
  _0xfb2d69.open("GET", "/code/skins?v2", true);
  _0xfb2d69.setRequestHeader("X-Requested-With", "XMLHttpRequest");
  _0xfb2d69.setRequestHeader(
    "Content-type",
    "application/x-www-form-urlencoded",
  );
  var _0x24eb83 = document.getElementById("moreSkins");
  _0x24eb83.innerHTML =
    '<img src="/res/svg/spinWhite.svg" style="height:20px"> Loading more skins...';
  function _0x4125a1() {
    this.skinsLoaded = false;
    _0x24eb83.innerHTML =
      "Could not load skin data, try refreshing the page or reopening the Settings.";
  }
  try {
    _0xfb2d69.send();
  } catch (_0x3b681d) {
    _0x4125a1();
  }
  var _0x3de6fe = this;
  _0xfb2d69.ontimeout =
    _0xfb2d69.onerror =
    _0xfb2d69.onabort =
      function () {
        _0x4125a1();
      };
  _0xfb2d69.onload = function () {
    if (_0xfb2d69.status === 200) {
      _0x3de6fe.moreSkins = JSON.parse(_0xfb2d69.responseText);
      _0x3de6fe.addSkins();
    } else {
      _0x4125a1();
    }
  };
};
Settings.prototype.reloadCanvases = function () {
  function _0x88a784(_0x41a180) {
    var _0x1cd7c8 = _0x41a180.cloneNode(false);
    _0x41a180.parentNode.replaceChild(_0x1cd7c8, _0x41a180);
    return _0x1cd7c8;
  }
  this.p.canvas = _0x88a784(this.p.canvas);
  this.p.holdCanvas = _0x88a784(this.p.holdCanvas);
  this.p.queueCanvas = _0x88a784(this.p.queueCanvas);
  _0x88a784(document.getElementById("glstats"));
};
Settings.prototype.closeSettings = function () {
  let _0x25c203 = false;
  let _0xe9786c = false;
  var _0x42a0a0 = parseInt(this.settingBoxes[1].value);
  this.setDAS(_0x42a0a0);
  var _0x323159 = parseInt(this.settingBoxes[2].value);
  this.setARR(_0x323159);
  this.soundEnabled = this.soundEnabledBox.checked;
  this.DMsound = this.DMsoundBox.checked;
  this.p.SEenabled = this.SEEnabledBox.checked;
  if (this.p.VSEenabled != this.VSEEnabledBox.checked) {
    _0xe9786c = true;
    this.p.VSEenabled = this.VSEEnabledBox.checked;
  }
  this.p.SEStartEnabled = this.SEStartEnabledBox.checked;
  this.p.SEFaultEnabled = this.SEFaultEnabledBox.checked;
  if (this.p.SErotate != this.SErotateEnabledBox.checked) {
    _0xe9786c = true;
  }
  this.p.SErotate = this.SErotateEnabledBox.checked;
  if (this.soundEnabled) {
    this.setCookie("eSE", "1");
  } else {
    this.setCookie("eSE", "0");
  }
  if (this.DMsound) {
    this.setCookie("eDM", "1");
  } else {
    this.setCookie("eDM", "0");
  }
  if (this.p.SEenabled) {
    this.setCookie("SE", "1");
  } else {
    this.setCookie("SE", "0");
  }
  if (this.p.SEStartEnabled) {
    this.setCookie("SEstart", "1");
  } else {
    this.setCookie("SEstart", "0");
  }
  if (this.p.SErotate) {
    this.setCookie("SErot", "1");
  } else {
    this.setCookie("SErot", "0");
  }
  if (this.p.VSEenabled) {
    this.setCookie("VSE", "1");
  } else {
    this.setCookie("VSE", "0");
  }
  var _0x4bbc09 = document.querySelector(
    'input[name="bSkin"]:checked',
  );
  var _0x540410 = _0x4bbc09 ? parseInt(_0x4bbc09.value) : 0;
  var _0x27fb2d = _0x540410;
  if (_0x540410 >= 1000) {
    this.p.customSkinPath = _0x4bbc09.dataset.p;
  } else if (_0x540410 === 6) {
    _0x540410 = _0x27fb2d = _0x27fb2d = 0;
    this.p.isInvisibleSkin = true;
  } else {
    this.p.isInvisibleSkin = false;
  }
  if (_0x540410 === 7) {
    _0x27fb2d = 0;
    _0x540410 = 7;
    this.p.monochromeSkin = this.defaultMonochrome =
      document.getElementById("monoColor").value;
  } else {
    this.p.monochromeSkin = false;
  }
  this.p.changeSkin(_0x27fb2d);
  this.setCookie("skinId", _0x540410);
  var _0x4053c5 = parseInt(
    document.querySelector('input[name="sds"]:checked').value,
  );
  var _0x437ff9 = this.p.softDropId !== _0x4053c5;
  this.p.softDropId = _0x4053c5;
  this.setCookie("SD", _0x4053c5);
  this.touchControlsEnabled = this.touchControls =
    this.touchEnabledBox.checked;
  this.mc.set({
    enable: this.touchControls,
    touchAction: this.touchActionVal(),
  });
  if (this.touchControlsEnabled) {
    this.setCookie("TouchC", "1");
  } else {
    this.setCookie("TouchC", "0");
  }
  this.restartSprintOnFF =
    document.getElementById("ffRestart").checked;
  var _0x1ad001 = parseInt(this.sfxSelect.value);
  if (this.SFXsetID !== _0x1ad001) {
    this.SFXsetID = _0x1ad001;
    this.setCookie("SFXset", this.SFXsetID);
    _0xe9786c = true;
  }
  _0x1ad001 = parseInt(this.vsfxSelect.value);
  if (this.VSFXsetID !== _0x1ad001) {
    this.VSFXsetID = _0x1ad001;
    this.setCookie("VSFXset", this.VSFXsetID);
    _0xe9786c = true;
  }
  if (_0xe9786c) {
    this.p.initSFX();
  }
  var _0x567325 = Math.round(createjs.Sound.volume * 100);
  this.setCookie("SEvol", _0x567325);
  this.rescaleNow = document.getElementById("rescaleNow").checked;
  if (this.rescaleNow) {
    this.setCookie("rescale", "1");
  } else {
    this.removeCookie("rescale");
  }
  this.DAScancel = document.getElementById("cancelDAS").checked;
  this.p.DASmethod = document.getElementById("dasMethod").checked
    ? 0
    : 1;
  if (this.p.DASmethod === 0) {
    this.setCookie("dasMethod", "0");
  } else {
    this.removeCookie("dasMethod");
  }
  this.gameStartNotif =
    document.getElementById("gameStartNotif").checked;
  if (this.gameStartNotif) {
    if (typeof Notification != "undefined") {
      Notification.requestPermission();
    }
    this.setCookie("gameStartNotif", "1");
  } else {
    this.removeCookie("gameStartNotif");
  }
  this.p.GameStats.reorder();
  this.setCookie("shownStats", this.shownStats);
  if (this.p.Live.authorized) {
    this.sendSettings();
  }
  var _0x385f79 = this.p.v;
  if (
    document.getElementById("wGL").checked &&
    this.p.v.NAME !== "webGL"
  ) {
    this.startWebGL(true);
  } else if (
    !document.getElementById("wGL").checked &&
    this.p.v.NAME !== "2d"
  ) {
    this.startCtx2D();
  }
  if (_0x385f79 !== this.p.v) {
    this.p.GameStats.setView(this.p.v);
  }
  let _0x40e2d9 = document.getElementById("mLay").checked;
  if (this.p.Mobile && this.p.Mobile.isMobile !== _0x40e2d9) {
    if (_0x40e2d9 !== this.p.Mobile.isMobileDetect()) {
      this.setCookie("mobile", _0x40e2d9);
    } else {
      this.removeCookie("mobile");
    }
    _0x25c203 = true;
  }
  this.box.style.display = "none";
  if (this.p.play) {
    this.p.Replay.config.sc = 1;
    if (_0x437ff9) {
      this.p.Replay.mode = -1;
      this.p.Live.showInChat(
        "",
        "<em>(SD) " + i18n.settingsChanged + "</em>",
      );
      this.p.transmitMode = 0;
      if (this.p.Live.socket) {
        this.p.Live.safeSend('{"t":25}');
      }
    }
  }
  if (_0x25c203) {
    location.reload();
  }
};
Settings.prototype.onStatGameModeChange = function (_0xc81bcf) {
  _0xc81bcf = _0xc81bcf === undefined ? 0 : _0xc81bcf.target.value;
  for (
    var _0x1f6686 = 1;
    _0x1f6686 < this.statCheckboxes.length;
    _0x1f6686++
  ) {
    this.statCheckboxes[_0x1f6686].checked =
      this.shownStats[_0xc81bcf] & (1 << (_0x1f6686 - 1));
  }
  this.updateStatsOptionsId();
};
Settings.prototype.onStatCheckboxChange = function (_0xdf37a8) {
  this.shownStats[parseInt(this.statGameModeSelect.value)] ^=
    1 << (_0xdf37a8 - 1);
  this.updateStatsOptionsId();
};
Settings.prototype.updateStatsOptionsId = function () {
  this.statOptId.textContent =
    this.shownStats[parseInt(this.statGameModeSelect.value)];
};
Settings.prototype.startCtx2D = function () {
  this.reloadCanvases();
  this.p.v = new Ctx2DView(this.p);
  this.p.v.initRenderer();
  this.p.redraw();
  this.p.redrawHoldBox();
  this.p.updateQueueBox();
};
Settings.prototype.startWebGL = function (_0x543ed2) {
  if (_0x543ed2) {
    this.reloadCanvases();
  }
  var _0x1d7953 = new WebGLView(this.p);
  if (_0x1d7953.isAvailable()) {
    this.p.v = _0x1d7953;
    this.p.v.initRenderer();
    this.p.redraw();
    this.p.redrawHoldBox();
    this.p.updateQueueBox();
  } else {
    this.webGlStartFailed = true;
    console.error("No WebGL support! Option has been disabled.");
    document.getElementById("wGL").checked = false;
    this.startCtx2D();
  }
};
Settings.prototype.setBanArtifact = function (_0x4a488f) {
  var _0xfd99e4 = 0;
  if (typeof _0x4a488f == "string") {
    var _0xe57e8c = _0x4a488f.match(/\d+/g);
    if (_0xe57e8c) {
      _0xfd99e4 = parseInt(_0xe57e8c[0]);
    }
  } else {
    _0xfd99e4 = _0x4a488f;
  }
  localStorage.setItem(self.BAN_ARTIFACT_KEY, _0xfd99e4);
};
Settings.prototype.getBanArtifact = function () {
  localStorage.removeItem("room2");
  return localStorage.getItem(self.BAN_ARTIFACT_KEY);
};
Settings.prototype.removeBanArtifact = function () {
  return localStorage.removeItem(self.BAN_ARTIFACT_KEY);
};
Settings.prototype.resetSettings = function () {
  let _0x344928 =
    localStorage.getItem(self.BAN_ARTIFACT_KEY) !== null;
  localStorage.clear();
  this.applyDefaults();
  this.openSettings();
  if (_0x344928) {
    this.setBanArtifact();
  }
  if (this.p.Mobile.isMobile) {
    location.reload();
  }
};
Settings.prototype.setDAS = function (_0x18e59c) {
  if (_0x18e59c > 0 && _0x18e59c < 5000) {
    this.DAS = _0x18e59c;
    this.setCookie("DAS", _0x18e59c);
  } else {
    alert(i18n.invalidDAS);
  }
};
Settings.prototype.setARR = function (_0x12cd83) {
  if (_0x12cd83 >= 0 && _0x12cd83 < 5000) {
    this.ARR = _0x12cd83;
    this.setCookie("ARR", _0x12cd83);
  } else {
    alert("ARR value is invalid.");
  }
};
Settings.prototype.handleKeyDown = function (_0x1191ea, _0x527abd) {
  document.getElementById("kc" + _0x527abd).innerHTML = _0x1191ea;
  this.inputBoxes[_0x527abd].value = this.getKeyName(_0x1191ea);
  this.setControlKey(_0x527abd, _0x1191ea);
  this.setCookie("k" + _0x527abd, _0x1191ea);
};
Settings.prototype.setControlKey = function (_0x40a1d8, _0x4c771d) {
  this.controls[_0x40a1d8 - 1] = _0x4c771d;
  switch (_0x40a1d8) {
    case 1:
      this.ml = _0x4c771d;
      break;
    case 2:
      this.mr = _0x4c771d;
      break;
    case 3:
      this.sd = _0x4c771d;
      break;
    case 4:
      this.hd = _0x4c771d;
      break;
    case 5:
      this.rl = _0x4c771d;
      break;
    case 6:
      this.rr = _0x4c771d;
      break;
    case 7:
      this.hk = _0x4c771d;
      break;
    case 8:
      this.dr = _0x4c771d;
      break;
    case 9:
    case 10:
      break;
    default:
      console.log("unknown");
  }
};
Settings.prototype.getKeyCodeFromAlias = function (_0xe199ac) {
  if (typeof _0xe199ac != "string") {
    return null;
  }
  switch (_0xe199ac) {
    case "U_LEFT":
      return this.ml;
    case "U_RIGHT":
      return this.mr;
    case "U_SD":
      return this.sd;
    case "U_HD":
      return this.hd;
    case "U_CCW":
      return this.rl;
    case "U_CW":
      return this.rr;
    case "U_180":
      return this.dr;
    case "U_RST":
      return this.controls[8];
    default:
      return null;
  }
};
Settings.prototype.loadFromJson = function (_0x161910) {
  for (var _0x53a06c = 0; _0x53a06c < 10; _0x53a06c++) {
    this.setControlKey(_0x53a06c + 1, _0x161910["k" + _0x53a06c]);
  }
  this.setDAS(_0x161910.DAS);
  this.setARR(_0x161910.ARR);
  this.p.SEenabled = _0x161910.SE;
  this.p.SEFaultEnabled = _0x161910.SEf;
  this.p.SEStartEnabled = _0x161910.SEs;
  if (_0x161910.bSp) {
    this.p.customSkinPath = _0x161910.bSp;
  }
  this.p.changeSkin(_0x161910.bSk);
  this.soundEnabled = _0x161910.eso;
  this.p.ghostEnabled = _0x161910.gho;
  this.setGrid(_0x161910.grs);
  this.rescaleNow = _0x161910.res;
  this.p.softDropId = _0x161910.sds;
  this.touchControlsEnabled = _0x161910.tou;
  this.DAScancel = _0x161910.DASca;
  this.volumeChange(_0x161910.vol);
  this.SFXsetID = _0x161910.SE > 0 ? _0x161910.SE - 1 : 0;
  if (_0x161910.mClr) {
    this.defaultMonochrome = _0x161910.mClr;
    if (_0x161910.bSk === 7) {
      this.p.monochromeSkin = _0x161910.mClr;
    }
  }
  if (
    _0x161910.wGL &&
    this.p.v.NAME !== "webGL" &&
    !this.webGlStartFailed
  ) {
    this.startWebGL();
  } else if (!_0x161910.wGL && this.p.v.NAME !== "2d") {
    this.startCtx2D();
  }
};
Settings.prototype.cookiePrefOnly = function () {
  var _0x4b6383 = 0;
  _0x4b6383 = this.getCookie("SErot");
  this.p.SErotate = _0x4b6383 === "1";
  _0x4b6383 = this.getCookie("VSE");
  this.p.VSEenabled = _0x4b6383 === "1";
  _0x4b6383 = parseInt(this.getCookie("VSFXset"));
  if (!isNaN(_0x4b6383)) {
    this.VSFXsetID = _0x4b6383;
  }
  _0x4b6383 = parseInt(this.getCookie("dasMethod"));
  this.p.DASmethod = _0x4b6383 === 0 ? 0 : 1;
  if ((_0x4b6383 = this.getCookie("shownStats")) != null) {
    this.shownStats = _0x4b6383
      .split(",")
      .map((_0x5bb64b) => parseInt(_0x5bb64b));
  }
  _0x4b6383 = this.getCookie("gameStartNotif");
  this.gameStartNotif = _0x4b6383 === "1";
};
Settings.prototype.tryToLoadControlsFromCookie = function () {
  if (conf_global.name !== "" && typeof sts != "undefined") {
    this.loadFromJson(sts);
    return true;
  }
  var _0x1856ca = 0;
  for (var _0x161226 = 1; _0x161226 <= 10; _0x161226++) {
    _0x1856ca = parseInt(this.getCookie("k" + _0x161226));
    if (!isNaN(_0x1856ca)) {
      this.setControlKey(_0x161226, _0x1856ca);
    }
  }
  _0x1856ca = parseInt(this.getCookie("DAS"));
  if (!isNaN(_0x1856ca)) {
    this.setDAS(_0x1856ca);
  }
  _0x1856ca = parseInt(this.getCookie("ARR"));
  if (!isNaN(_0x1856ca)) {
    this.setARR(_0x1856ca);
  }
  _0x1856ca = parseInt(this.getCookie("skinId"));
  if (!isNaN(_0x1856ca)) {
    this.p.changeSkin(parseInt(_0x1856ca));
  }
  _0x1856ca = this.getCookie("SE");
  this.p.SEenabled = _0x1856ca !== "0";
  _0x1856ca = this.getCookie("SEstart");
  this.p.SEStartEnabled = _0x1856ca !== "0";
  _0x1856ca = this.getCookie("eSE");
  this.soundEnabled = _0x1856ca !== "0" && _0x1856ca !== null;
  _0x1856ca = this.getCookie("eDM");
  this.DMsound = _0x1856ca === "1" || _0x1856ca === null;
  _0x1856ca = parseInt(this.getCookie("SD"));
  if (!isNaN(_0x1856ca)) {
    this.p.softDropId = _0x1856ca;
  }
  _0x1856ca = this.getCookie("TouchC");
  this.touchControlsEnabled = _0x1856ca === "1";
  _0x1856ca = parseInt(this.getCookie("SFXset"));
  if (!isNaN(_0x1856ca)) {
    this.SFXsetID = _0x1856ca;
  }
  _0x1856ca = parseInt(this.getCookie("SEvol"));
  if (!isNaN(_0x1856ca) && _0x1856ca >= 0 && _0x1856ca <= 100) {
    this.volumeChange(parseInt(_0x1856ca));
  }
  _0x1856ca = this.getCookie("rescale");
  this.rescaleNow = _0x1856ca !== null && _0x1856ca !== "0";
  this.setGrid(1);
};
Settings.prototype.sendSettings = function () {
  var _0x2167b0;
  var _0x3aa750;
  var _0x151053;
  var _0x31ed7c = {};
  _0x2167b0 = document.getElementById("settingsBox");
  var _0x58ea3f = Array.prototype.slice.call(
    _0x2167b0.getElementsByTagName("input"),
    0,
  );
  var _0x1bd5ce = Array.prototype.slice.call(
    _0x2167b0.getElementsByTagName("select"),
    0,
  );
  _0x3aa750 = _0x58ea3f.concat(_0x1bd5ce);
  for (_0x151053 = 0; _0x151053 < _0x3aa750.length; ++_0x151053) {
    if (
      _0x3aa750[_0x151053].id.substr(0, 5) !== "input" &&
      _0x3aa750[_0x151053].id !== "ffRestart" &&
      _0x3aa750[_0x151053].id.substr(0, 4) !== "stat" &&
      _0x3aa750[_0x151053].id !== "gameStartNotif"
    ) {
      if (_0x3aa750[_0x151053].type === "radio") {
        if (_0x3aa750[_0x151053].checked) {
          let _0x5e391d = _0x3aa750[_0x151053].name.substr(0, 3);
          _0x31ed7c[_0x5e391d] = _0x3aa750[_0x151053].value;
          if (_0x5e391d == "bSk" && _0x3aa750[_0x151053].dataset.p) {
            _0x31ed7c.bSp = _0x3aa750[_0x151053].dataset.p;
          }
        }
      } else if (_0x3aa750[_0x151053].type === "checkbox") {
        _0x31ed7c[
          (_0x3aa750[_0x151053].id === "cancelDAS" ? "DASca" : null)
            ? _0x3aa750[_0x151053].id === "cancelDAS"
              ? "DASca"
              : null
            : _0x3aa750[_0x151053].id.substr(0, 3)
        ] = _0x3aa750[_0x151053].checked;
      } else {
        _0x31ed7c[_0x3aa750[_0x151053].id.substr(0, 3)] =
          _0x3aa750[_0x151053].value;
        if (
          _0x3aa750[_0x151053].id === this.sfxSelect.id &&
          _0x31ed7c.SE !== undefined &&
          _0x31ed7c.SE
        ) {
          _0x31ed7c.SE += parseInt(_0x3aa750[_0x151053].value);
        }
      }
    }
  }
  _0x31ed7c.key = this.controls;
  _0x31ed7c.stats = this.shownStats;
  this.postSettings(JSON.stringify(_0x31ed7c));
};
Settings.prototype.postSettings = function (_0x404190) {
  var _0xc14ce3 = document.head.querySelector(
    "[name=csrf-token]",
  ).content;
  var _0x3aa999 = new XMLHttpRequest();
  var _0x8ba4c5 = "d=" + encodeURIComponent(_0x404190);
  _0x3aa999.timeout = 10000;
  _0x3aa999.open("POST", "/code/settings", true);
  _0x3aa999.setRequestHeader("X-Requested-With", "XMLHttpRequest");
  _0x3aa999.setRequestHeader("X-CSRF-TOKEN", _0xc14ce3);
  _0x3aa999.setRequestHeader(
    "Content-type",
    "application/x-www-form-urlencoded",
  );
  _0x3aa999.send(_0x8ba4c5);
  _0x3aa999.onload = function () {
    _0x3aa999.status;
  };
};
Settings.prototype.onGameStart = function () {
  if (this.touchControlsEnabled) {
    this.setTouchControls(1);
  }
};
Settings.prototype.onGameEnd = function () {
  if (this.touchControlsEnabled) {
    this.setTouchControls(0);
  }
};
Settings.prototype.volumeChange = function (_0x4aedc3) {
  document.getElementById("vol-control").value = _0x4aedc3;
  document.getElementById("vol-value").innerHTML = _0x4aedc3 + "%";
  createjs.Sound.volume = _0x4aedc3 / 100;
};
Settings.prototype.touchActionVal = function () {
  if (this.touchControls) {
    return "none";
  } else {
    return "auto";
  }
};
Settings.prototype.touchUsed = function () {
  this.touchActuallyUsed = true;
  if (!this.p.Mobile.isMobile) {
    this.mainDiv.style.border = "1px solid #0062ca";
    showElem(document.getElementById("tc-area-desc"));
  }
};
Settings.prototype.setTouchControls = function (_0xf2cf26) {
  if (_0xf2cf26 === 0) {
    this.touchControls = false;
    this.mc.set({
      enable: this.touchControls,
      touchAction: this.touchActionVal(),
    });
    this.mainDiv.removeEventListener(
      "touchstart",
      this.preventZoomHandler,
    );
    if (this.touchActuallyUsed) {
      this.mainDiv.style.border = "none";
      hideElem(document.getElementById("tc-area-desc"));
    }
  } else {
    if (!this.touchControlsEnabled) {
      return false;
    }
    this.touchControls = true;
    this.mc.set({
      enable: this.touchControls,
      touchAction: this.touchActionVal(),
    });
    this.mainDiv.addEventListener(
      "touchstart",
      this.preventZoomHandler,
    );
    if (this.touchActuallyUsed) {
      this.touchUsed();
    }
  }
};
Settings.prototype.setCookie = function (_0xb98fe8, _0xf82180) {
  localStorage.setItem(_0xb98fe8, _0xf82180);
};
Settings.prototype.getCookie = function (_0x3097af) {
  return localStorage.getItem(_0x3097af);
};
Settings.prototype.removeCookie = function (_0x1d4b4d) {
  localStorage.removeItem(_0x1d4b4d);
};
Settings.prototype.onControlKeySet = function (_0xb7ed84, _0x409ae1) {
  this.handleKeyDown(_0x409ae1.keyCode, _0xb7ed84);
  _0x409ae1.preventDefault();
};
Settings.prototype.setGrid = function (_0x218d88) {
  this.gridMode = _0x218d88;
  this.p.drawBgGrid(this.gridMode);
};
Settings.prototype.nullpoDAS = function () {
  var _0x41cebb = parseInt(prompt(i18n.enterNullDAS));
  if (!isNaN(_0x41cebb) && _0x41cebb >= 0 && _0x41cebb <= 1000) {
    var _0x1c1385 = Math.round(_0x41cebb * 16.666666666666668);
    if (
      confirm(
        i18n.suggestedIs + " " + _0x1c1385 + ". " + i18n.applyConfirm,
      ) === true
    ) {
      this.settingBoxes[1].value = _0x1c1385;
    }
  }
};
Settings.prototype.setupSwipeControl = function () {
  var _0x240c55 = this.p;
  var _0x1a8175 = {
    keyCode: 0,
    repeat: false,
    preventDefault: function () {},
    stopPropagation: function () {},
  };
  var _0x2f8bdf = this.controls;
  var _0x1595de = 0;
  var _0x20758d = 0;
  var _0x2de178 = false;
  var _0x5a15d0 = 25;
  var _0x5c659d = this;
  var _0x1c3710 = _0x240c55.block_size;
  this.mc.get("pan").set({
    direction: Hammer.DIRECTION_ALL,
    threshold: 10,
  });
  this.mc.on("panstart", function (_0x166a70) {
    if (!_0x5c659d.touchActuallyUsed) {
      _0x5c659d.touchUsed();
    }
    _0x1595de = 0;
    _0x2de178 = false;
    _0x20758d = true;
    _0x5a15d0 = _0x5c659d.ARR <= 25 ? 25 : _0x5c659d.ARR;
  });
  this.mc.on("pan", function (_0x3b508d) {
    if (_0x3b508d.direction === Hammer.DIRECTION_DOWN) {
      if (_0x3b508d.distance < _0x240c55.block_size) {
        _0x1c3710 = _0x240c55.block_size;
      }
      if (
        _0x3b508d.velocityY < 0.15 &&
        _0x3b508d.distance > _0x1c3710
      ) {
        _0x2de178 = true;
        _0x1c3710 += _0x240c55.block_size;
        _0x240c55.gravityStep(0);
        _0x240c55.Replay.add(
          new ReplayAction(
            _0x240c55.Replay.Action.GRAVITY_STEP,
            _0x240c55.timestamp(),
          ),
        );
        _0x240c55.redraw();
      }
    } else if (_0x3b508d.direction === Hammer.DIRECTION_LEFT) {
      if (_0x3b508d.deltaX <= (_0x1595de - 1) * _0x5a15d0) {
        _0x1595de--;
        if (_0x20758d) {
          _0x1595de--;
          _0x20758d = false;
        }
        if (_0x240c55.moveCurrentBlock(-1, false)) {
          _0x240c55.Replay.add(
            new ReplayAction(
              _0x240c55.Replay.Action.MOVE_LEFT,
              _0x240c55.timestamp(),
            ),
          );
        }
      }
    } else if (
      _0x3b508d.direction === Hammer.DIRECTION_RIGHT &&
      _0x3b508d.deltaX >= (_0x1595de + 1) * _0x5a15d0
    ) {
      _0x1595de++;
      if (_0x20758d) {
        _0x1595de++;
        _0x20758d = false;
      }
      if (_0x240c55.moveCurrentBlock(1, false)) {
        _0x240c55.Replay.add(
          new ReplayAction(
            _0x240c55.Replay.Action.MOVE_RIGHT,
            _0x240c55.timestamp(),
          ),
        );
      }
    }
  });
  this.mc.on("panend", function (_0x7f3d3b) {
    _0x1c3710 = _0x240c55.block_size;
    _0x240c55.gameStep = 0.9;
    _0x240c55.timer = 0;
    if (_0x7f3d3b.direction === Hammer.DIRECTION_DOWN) {
      if (
        !_0x2de178 &&
        _0x7f3d3b.deltaY >= 40 &&
        Math.abs(_0x7f3d3b.overallVelocityY) >= 0.15
      ) {
        _0x1a8175.keyCode = _0x2f8bdf[3];
        _0x240c55.keyInput2(_0x1a8175);
        _0x240c55.keyInput3(_0x1a8175);
      }
    } else if (_0x7f3d3b.direction === Hammer.DIRECTION_UP) {
      _0x1a8175.keyCode = _0x2f8bdf[6];
      _0x240c55.keyInput2(_0x1a8175);
      _0x240c55.keyInput3(_0x1a8175);
    }
  });
  this.mc.on("panleft", function (_0x3d82f6) {
    if (
      Math.abs(_0x3d82f6.overallVelocityX) > 0.8 &&
      Math.abs(_0x3d82f6.deltaX) > _0x5a15d0 * 4 &&
      _0x240c55.moveBlockToTheWall(-1)
    ) {
      _0x240c55.Replay.add(
        new ReplayAction(
          _0x240c55.Replay.Action.DAS_LEFT,
          _0x240c55.timestamp(),
        ),
      );
    }
  });
  this.mc.on("panright", function (_0x46d52b) {
    if (
      Math.abs(_0x46d52b.overallVelocityX) > 0.8 &&
      Math.abs(_0x46d52b.deltaX) > _0x5a15d0 * 4 &&
      _0x240c55.moveBlockToTheWall(1)
    ) {
      _0x240c55.Replay.add(
        new ReplayAction(
          _0x240c55.Replay.Action.DAS_RIGHT,
          _0x240c55.timestamp(),
        ),
      );
    }
  });
  this.mc.on("tap", function (_0x168f32) {
    var _0x2d5cbd = _0x240c55.canvas.getBoundingClientRect();
    var _0x11d66 = _0x168f32.center.x - _0x2d5cbd.left;
    _0x168f32.center.y;
    _0x2d5cbd.top;
    if (_0x11d66 > _0x240c55.canvas.offsetWidth / 2) {
      _0x1a8175.keyCode = _0x2f8bdf[5];
      _0x240c55.keyInput2(_0x1a8175);
      _0x240c55.keyInput3(_0x1a8175);
    } else {
      _0x1a8175.keyCode = _0x2f8bdf[4];
      _0x240c55.keyInput2(_0x1a8175);
      _0x240c55.keyInput3(_0x1a8175);
    }
  });
};
Settings.prototype.clearAllCookies = function () {
  var _0x4056fa = document.cookie.split(";");
  for (var _0x127206 = 0; _0x127206 < _0x4056fa.length; _0x127206++) {
    var _0x10e06e = _0x4056fa[_0x127206];
    var _0x4209dd = _0x10e06e.indexOf("=");
    var _0x415265 =
      _0x4209dd > -1 ? _0x10e06e.substr(0, _0x4209dd) : _0x10e06e;
    document.cookie =
      _0x415265 + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
};
Settings.prototype.clearRealCookies = function () {
  if (("; " + document.cookie).split("; DAS=").length === 2) {
    this.clearAllCookies();
  }
};
Settings.prototype.preventZoom = function (_0x476964) {
  var _0xf9fbee = _0x476964.timeStamp;
  var _0x24a467 =
    _0xf9fbee -
    (_0x476964.currentTarget.dataset.lastTouch || _0xf9fbee);
  var _0x110684 = _0x476964.touches.length;
  _0x476964.currentTarget.dataset.lastTouch = _0xf9fbee;
  if (!!_0x24a467 && !(_0x24a467 > 500) && !(_0x110684 > 1)) {
    _0x476964.preventDefault();
    _0x476964.target.click();
  }
};
Settings.prototype.registerColorPicker = function () {
  var _0x374b67 = new CP(document.querySelector(".colorPicker"));
  _0x374b67.on("change", function (_0x217ad5) {
    this.source.value = "#" + _0x217ad5;
    this.source.style.backgroundColor = "#" + _0x217ad5;
  });
  _0x374b67.on("enter", function (_0x3db979) {
    _0x374b67.set(this.source.value);
    document.getElementById("bs7").checked = true;
  });
  return _0x374b67;
};
Settings.prototype.initGamePad = function (_0x40c6e5) {
  var _0x430da1 = _0x40c6e5.gamepad;
  if (
    this.gamepadFound &&
    _0x430da1.buttons.length > this.gamepadButtons.length
  ) {
    this.gamepadButtons = [];
  }
  if (_0x430da1.buttons.length > 0 && !this.gamepadFound) {
    this.gamepadButtons = [];
    for (
      let _0x2942f8 = 0;
      _0x2942f8 < _0x430da1.buttons.length;
      _0x2942f8++
    ) {
      this.gamepadButtons.push({
        pressed: false,
        index: _0x2942f8,
      });
    }
    this.gamepadFound = true;
  }
  console.log(
    "Gamepad connected at index %d: %s. %d buttons, %d axes.",
    _0x40c6e5.gamepad.index,
    _0x40c6e5.gamepad.id,
    _0x40c6e5.gamepad.buttons.length,
    _0x40c6e5.gamepad.axes.length,
  );
};
Settings.prototype.removeGamePad = function (_0x184ff5) {
  this.gamepadFound = false;
  this.gamepadButtons = [];
  console.log("Lost connection with the gamepad.");
};
Settings.prototype.processGamepad = function () {
  try {
    var _0x36ffea = navigator.getGamepads
      ? navigator.getGamepads()
      : navigator.webkitGetGamepads
        ? navigator.webkitGetGamepads
        : [];
    if (!_0x36ffea) {
      return;
    }
    var _0x4b86ec = null;
    for (
      let _0x22fd46 = 0;
      _0x22fd46 < _0x36ffea.length;
      _0x22fd46++
    ) {
      if (
        _0x36ffea[_0x22fd46] &&
        _0x36ffea[_0x22fd46].buttons.length > 0
      ) {
        _0x4b86ec = _0x36ffea[_0x22fd46];
        let _0x33a7e8 = false;
        for (
          let _0x28d4cd = 0;
          _0x28d4cd < _0x4b86ec.buttons.length;
          _0x28d4cd++
        ) {
          let _0x3b244c = _0x4b86ec.buttons[_0x28d4cd];
          if (
            _0x3b244c.pressed &&
            !this.gamepadButtons[_0x28d4cd].pressed
          ) {
            this.gamepadButtons[_0x28d4cd].pressed = true;
            let _0x758bcc = new KeyboardEvent("keydown", {
              keyCode: 230 + _0x28d4cd,
              bubbles: true,
            });
            document.activeElement.dispatchEvent(_0x758bcc);
            _0x33a7e8 = true;
          } else if (
            !_0x3b244c.pressed &&
            this.gamepadButtons[_0x28d4cd].pressed
          ) {
            this.gamepadButtons[_0x28d4cd].pressed = false;
            let _0xe079f9 = new KeyboardEvent("keyup", {
              keyCode: 230 + _0x28d4cd,
              bubbles: true,
            });
            document.activeElement.dispatchEvent(_0xe079f9);
            _0x33a7e8 = true;
          }
        }
        if (_0x33a7e8) {
          break;
        }
      }
    }
  } catch (_0x24a529) {
    console.error(_0x24a529);
  }
};
Settings.prototype.getKeyName = function (_0x1499af) {
  if (_0x1499af >= 230 && _0x1499af <= 300) {
    let _0x50a2b5 = _0x1499af - 230;
    return "GPAD_" + String.fromCharCode(65 + _0x50a2b5);
  }
  var _0x1c92ea = {
    0: "\\",
    8: "backspace",
    9: "tab",
    12: "num",
    13: "enter",
    16: "shift",
    17: "ctrl",
    18: "alt",
    19: "pause",
    20: "caps",
    27: "esc",
    32: "space",
    33: "pageup",
    34: "pagedown",
    35: "end",
    36: "home",
    37: "left",
    38: "up",
    39: "right",
    40: "down",
    44: "print",
    45: "insert",
    46: "delete",
    48: "0",
    49: "1",
    50: "2",
    51: "3",
    52: "4",
    53: "5",
    54: "6",
    55: "7",
    56: "8",
    57: "9",
    65: "a",
    66: "b",
    67: "c",
    68: "d",
    69: "e",
    70: "f",
    71: "g",
    72: "h",
    73: "i",
    74: "j",
    75: "k",
    76: "l",
    77: "m",
    78: "n",
    79: "o",
    80: "p",
    81: "q",
    82: "r",
    83: "s",
    84: "t",
    85: "u",
    86: "v",
    87: "w",
    88: "x",
    89: "y",
    90: "z",
    91: "cmd",
    92: "cmd",
    93: "cmd",
    96: "num_0",
    97: "num_1",
    98: "num_2",
    99: "num_3",
    100: "num_4",
    101: "num_5",
    102: "num_6",
    103: "num_7",
    104: "num_8",
    105: "num_9",
    106: "num_multiply",
    107: "num_add",
    108: "num_enter",
    109: "num_subtract",
    110: "num_decimal",
    111: "num_divide",
    112: "f1",
    113: "f2",
    114: "f3",
    115: "f4",
    116: "f5",
    117: "f6",
    118: "f7",
    119: "f8",
    120: "f9",
    121: "f10",
    122: "f11",
    123: "f12",
    124: "print",
    144: "num",
    145: "scroll",
    186: ";",
    187: "=",
    188: ",",
    189: "-",
    190: ".",
    191: "/",
    192: "`",
    219: "[",
    220: "\\",
    221: "]",
    222: "'",
    223: "`",
    224: "cmd",
    225: "alt",
    57392: "ctrl",
    63289: "num",
    59: ";",
    61: "-",
    173: "=",
  };
  if (_0x1c92ea[_0x1499af] !== undefined) {
    return _0x1c92ea[_0x1499af];
  } else {
    return "KeyCode " + _0x1499af;
  }
};
GameSlots.prototype.setZoom = function (_0x58b194) {
  this.zoom = _0x58b194 / 100;
  this.w = this.baseSize.playersW * this.zoom;
  this.h = this.baseSize.playersH * ((this.zoom - 1) / 2 + 1);
  var _0x4c4874 = -(this.w - this.baseSize.playersW) / 2;
  document.getElementById("players").style.width = this.w + "px";
  document.getElementById("main").style.marginLeft = _0x4c4874 + "px";
  document.getElementById("gameFrame").style.width =
    this.baseSize.gameFrame +
    (this.w - this.baseSize.playersW + _0x4c4874) +
    "px";
  this.autoScale();
};
GameSlots.prototype.fullScreen = function (_0x5bbbed) {
  this.isFullscreen = _0x5bbbed;
  document.getElementById("zoomControl").disabled = _0x5bbbed;
  if (_0x5bbbed) {
    hideElem(document.getElementById("main"));
    document.getElementById("players").style.width = "100%";
    document.getElementById("gameFrame").style.width = "100%";
    var _0xaef594 = document.getElementById("gc");
    _0xaef594.style.width = "95%";
    this.w = this.gsDiv.offsetWidth;
    this.h = Math.min(this.w / 2, _0xaef594.offsetHeight * 1.05);
    this.zoom = Math.max(1, this.h / 450);
    this.autoScale();
  } else {
    showElem(document.getElementById("main"));
    document.getElementById("players").style.width = null;
    document.getElementById("gameFrame").style.width = null;
    document.getElementById("gc").style.width = null;
    this.setZoom(
      parseInt(document.getElementById("zoomControl").value),
    );
  }
};
GameSlots.prototype.numRows = function (_0x401503) {
  if (_0x401503 <= 3) {
    return 1;
  } else if (_0x401503 <= 10) {
    return 2;
  } else if (_0x401503 <= 39) {
    return 3;
  } else {
    return 4;
  }
};
GameSlots.prototype.nmob = function (_0x25cc67) {
  return this.blocksY * Math.round(_0x25cc67 / this.blocksY);
};
GameSlots.prototype.swapSlot = function (_0x247c9b, _0x4488b1) {
  this.cidSlots[this.slots[_0x4488b1].cid] = _0x247c9b;
  this.cidSlots[this.slots[_0x247c9b].cid] = _0x4488b1;
  var _0x101f43 = this.slots[_0x4488b1].cid;
  var _0x16ebeb = this.slots[_0x4488b1].name;
  this.slots[_0x4488b1].cid = this.slots[_0x247c9b].cid;
  this.slots[_0x4488b1].name = this.slots[_0x247c9b].name;
  this.slots[_0x247c9b].cid = _0x101f43;
  this.slots[_0x247c9b].name = _0x16ebeb;
};
GameSlots.prototype.mvSlot = function (_0x3948d6, _0x200903) {
  this.slots[_0x200903].cid = this.slots[_0x3948d6].cid;
  this.slots[_0x200903].name.innerHTML =
    this.slots[_0x3948d6].name.innerHTML;
  this.slots[_0x3948d6].vacantClear();
  this.cidSlots[this.slots[_0x200903].cid] = _0x200903;
};
GameSlots.prototype.shrink = function () {
  var _0x31884e = 0;
  for (
    var _0x1c586c = 0;
    _0x1c586c < this.slots.length;
    _0x1c586c++
  ) {
    if (this.slots[_0x1c586c].cid === -1) {
      for (
        var _0xc0643c = _0x1c586c + 1;
        _0xc0643c < this.slots.length &&
        this.slots[_0xc0643c].cid === -1;
      ) {
        _0xc0643c++;
      }
      if (_0xc0643c === this.slots.length) {
        break;
      }
      if (this.slots[_0xc0643c].cid !== -1) {
        this.mvSlot(_0xc0643c, _0x1c586c);
        _0x31884e++;
      }
    } else {
      _0x31884e++;
    }
  }
  return _0x31884e;
};
GameSlots.prototype.teamOfSlot = function (_0x346ad3) {
  return this.p.Live.clients[this.slots[_0x346ad3].cid].team;
};
GameSlots.prototype.teamOfCid = function (_0x2e5419) {
  return this.p.Live.clients[_0x2e5419].team;
};
GameSlots.prototype.autoScale = function () {
  if (this.p.Live.liveMode === 2) {
    var _0x1f80a8;
    var _0x44d3b1;
    this.shrink();
    for (
      _0x1f80a8 = 0;
      _0x1f80a8 < this.slots.length - 1;
      _0x1f80a8++
    ) {
      var _0xc5f6d1 = 0;
      for (
        _0x44d3b1 = 0;
        _0x44d3b1 < this.slots.length - _0x1f80a8 - 1 &&
        this.slots[_0x44d3b1].cid !== -1 &&
        this.slots[_0x44d3b1 + 1].cid !== -1;
        _0x44d3b1++
      ) {
        if (
          parseInt(this.teamOfSlot(_0x44d3b1)) >
          parseInt(this.teamOfSlot(_0x44d3b1 + 1))
        ) {
          this.swapSlot(_0x44d3b1, _0x44d3b1 + 1);
          _0xc5f6d1++;
        }
      }
      if (!_0xc5f6d1) {
        break;
      }
    }
    this.tsetup([
      this.teamMembers[0].length,
      this.teamMembers[1].length,
    ]);
  } else {
    this.hideTags();
    var _0x14ac6 = this.shrink();
    if (!_0x14ac6) {
      _0x14ac6 = 1;
    }
    this.setup(_0x14ac6);
  }
};
GameSlots.prototype.hideTags = function () {
  for (let _0x219c9d of this.teamTags) {
    if (_0x219c9d) {
      _0x219c9d.style.display = "none";
    }
  }
};
GameSlots.prototype.updateTeamNames = function (_0x4c2b5d) {
  this.teamData = _0x4c2b5d;
  for (var _0x5d5d71 in _0x4c2b5d) {
    if (!this.teamMembers.hasOwnProperty(_0x5d5d71)) {
      this.teamMembers[_0x5d5d71] = [];
    }
  }
  this.autoScale();
};
GameSlots.prototype.initTeamTag = function (
  _0x27c41b,
  _0x5e347a,
  _0x2c0d1b,
  _0x5b07d2,
) {
  var _0x13e822 = null;
  if (this.teamTags[_0x27c41b] !== undefined) {
    (_0x13e822 = this.teamTags[_0x27c41b]).style.display = "block";
  } else {
    _0x13e822 = this.teamTags[_0x27c41b] =
      document.createElement("div");
    this.gsDiv.appendChild(_0x13e822);
  }
  var _0x435c53 = _0x27c41b.toString();
  _0x13e822.textContent = this.teamData[_0x435c53].name;
  _0x13e822.classList.add("teamTag");
  _0x13e822.style.minWidth = _0x5b07d2 + 2 + "px";
  _0x13e822.style.height = this.tagHeight + "px";
  _0x13e822.style.left = _0x5e347a + "px";
  _0x13e822.style.top = _0x2c0d1b + "px";
  if (_0x5b07d2 + 2 < 170) {
    _0x13e822.style.minWidth = "170px";
    _0x13e822.style.left =
      _0x5e347a - (170 - (_0x5b07d2 + 2)) / 2 + "px";
  }
  _0x13e822.style.backgroundColor = this.teamData[_0x435c53].color;
};
GameSlots.prototype.tsetup = function (_0x42604c) {
  var _0x3f2b8e = Math.max.apply(null, _0x42604c);
  var _0x151f83 = this.h / 2;
  var _0x7d4315 = 0;
  this.isExtended = false;
  this.nameFontSize = 15;
  this.nameHeight = 18;
  var _0x424a50 =
    (_0x580a9a = _0x3f2b8e) === 1
      ? 0
      : (_0x580a9a === 2 ? 30 : 60) / (_0x580a9a - 1);
  var _0x1eff25 = this.tagHeight + 2;
  this.slotHeight = this.nmob(_0x151f83 - this.nameHeight - 15);
  this.redBarWidth = Math.ceil(this.slotHeight / 55) + 1;
  this.slotWidth = this.slotHeight / 2 + this.redBarWidth;
  var _0x19fbe2 =
    this.slotWidth * _0x580a9a + (_0x580a9a - 1) * _0x424a50;
  if (_0x19fbe2 > this.w) {
    this.slotWidth = Math.floor(this.w / _0x580a9a) - _0x424a50;
    this.slotHeight = this.nmob(
      (this.slotWidth - this.redBarWidth) * 2,
    );
    this.redBarWidth = Math.ceil(this.slotHeight / 55) + 1;
    this.slotWidth = this.slotHeight / 2 + this.redBarWidth;
    _0x19fbe2 =
      this.slotWidth * _0x580a9a + (_0x580a9a - 1) * _0x424a50;
  }
  this.liveBlockSize = this.slotHeight / 20;
  var _0x45fbb4 = this.slotHeight + this.nameHeight + 15 + _0x1eff25;
  this.matrixHeight = this.slotHeight;
  this.matrixWidth = this.slotWidth;
  for (var _0x283c01 = 0; _0x283c01 < _0x42604c.length; _0x283c01++) {
    var _0x580a9a = _0x42604c[_0x283c01];
    _0x19fbe2 =
      this.slotWidth * _0x580a9a + (_0x580a9a - 1) * _0x424a50;
    var _0x1c8fbf = Math.floor((this.w - _0x19fbe2) / 2);
    if (_0x580a9a > 0) {
      this.initTeamTag(
        _0x283c01,
        _0x1c8fbf,
        _0x45fbb4 * _0x283c01,
        _0x19fbe2,
      );
    }
    for (var _0x39abf5 = 0; _0x39abf5 < _0x580a9a; _0x39abf5++) {
      var _0x3131c7 =
        _0x1c8fbf + _0x39abf5 * (this.slotWidth + _0x424a50);
      var _0x2e498f = _0x45fbb4 * _0x283c01 + _0x1eff25;
      if (_0x7d4315 >= this.slots.length) {
        this.slots[_0x7d4315] = new Slot(
          _0x7d4315,
          _0x3131c7,
          _0x2e498f,
          this,
        );
      } else {
        this.slots[_0x7d4315].x = _0x3131c7;
        this.slots[_0x7d4315].y = _0x2e498f;
        this.slots[_0x7d4315].init();
      }
      _0x7d4315++;
    }
  }
  for (this.shownSlots = _0x7d4315; _0x7d4315 < this.slots.length; ) {
    this.slots[_0x7d4315].hide();
    _0x7d4315++;
  }
  this.realHeight = _0x45fbb4 * _0x42604c.length - 15;
  this.resizeElements();
};
GameSlots.prototype.setup = function (_0x370820, _0x537178 = false) {
  if (!this.isFullscreen && this.zoom < 1.5 && _0x370820 < 50) {
    this.rowCount = this.numRows(_0x370820);
  } else if (!_0x537178) {
    var _0x5ae4ce = [0, 3];
    var _0x24feca = Math.ceil(_0x370820 / 10) + 1;
    for (var _0x51f022 = 1; _0x51f022 <= _0x24feca; _0x51f022++) {
      this.rowCount = _0x51f022;
      this.setup(_0x370820, true);
      if (this.slotWidth > _0x5ae4ce[0]) {
        _0x5ae4ce[0] = this.slotWidth;
        _0x5ae4ce[1] = _0x51f022;
      }
    }
    this.rowCount = _0x5ae4ce[1];
  }
  var _0x58799e = Math.ceil(_0x370820 / this.rowCount);
  var _0x419820 = Math.floor(this.h / this.rowCount);
  var _0x566083 = _0x58799e === 2 ? 30 : 60;
  this.isExtended =
    this.extendedAvailable &&
    (this.forceExtended ||
      this.extendedView.indexOf(_0x370820) !== -1);
  if (this.isExtended) {
    if (this.rowCount === 1) {
      _0x566083 = 30;
    } else if (this.rowCount === 2) {
      var _0x35594a = [0, 0, 90, 65];
      _0x566083 =
        _0x58799e < _0x35594a.length ? _0x35594a[_0x58799e] : 60;
    }
  }
  var _0x46aada = this.rowCount === 1 ? 0 : 10;
  var _0x18d773 = _0x58799e === 1 ? 0 : _0x566083 / (_0x58799e - 1);
  var _0x1e53f5 = this.slotStats ? 3 : 1;
  if (this.rowCount >= 3) {
    this.nameFontSize = 10;
    this.nameHeight = 12;
  } else {
    this.nameFontSize = 15;
    this.nameHeight = 18;
  }
  this.nameFontSize = Math.ceil(
    this.nameFontSize * Math.max(1, this.zoom * 0.8),
  );
  this.nameHeight = Math.ceil(
    this.nameHeight * Math.max(1, this.zoom * 0.8),
  );
  _0x18d773 *= this.zoom;
  this.matrixHeight = this.nmob(
    _0x419820 - this.nameHeight * _0x1e53f5 - _0x46aada,
  );
  this.redBarWidth = Math.ceil(this.matrixHeight / 55) + 1;
  this.matrixWidth = this.matrixHeight / 2 + this.redBarWidth;
  this.slotWidth = this.isExtended
    ? this.matrixWidth * 1.7413
    : this.matrixWidth;
  var _0xfae97b =
    this.slotWidth * _0x58799e + (_0x58799e - 1) * _0x18d773;
  if (_0xfae97b > this.w) {
    this.slotWidth = Math.floor(
      (this.w - (_0x58799e - 1) * _0x18d773) / _0x58799e,
    );
    this.matrixWidth = this.isExtended
      ? this.slotWidth / 1.7413
      : this.slotWidth;
    this.matrixHeight = this.nmob(
      (this.matrixWidth - this.redBarWidth) * 2,
    );
    this.redBarWidth = Math.ceil(this.matrixHeight / 55) + 1;
    this.matrixWidth = this.matrixHeight / 2 + this.redBarWidth;
    this.slotWidth = this.isExtended
      ? this.matrixWidth * 1.7413
      : this.matrixWidth;
    _0xfae97b =
      this.slotWidth * _0x58799e + (_0x58799e - 1) * _0x18d773;
  }
  this.slotHeight = this.matrixHeight + this.nameHeight * _0x1e53f5;
  this.realHeight =
    this.slotHeight * this.rowCount + _0x46aada * (this.rowCount - 1);
  this.liveBlockSize = this.matrixHeight / 20;
  this.holdQueueBlockSize = this.isExtended
    ? this.liveBlockSize * 0.8
    : 0;
  var _0x2c66be = Math.floor((this.w - _0xfae97b) / 2);
  if (!_0x537178) {
    var _0x4a0011 = 0;
    for (var _0x1af700 = 0; _0x1af700 < this.rowCount; _0x1af700++) {
      for (_0x51f022 = 0; _0x51f022 < _0x58799e; _0x51f022++) {
        var _0x5a711e =
          _0x2c66be + _0x51f022 * (this.slotWidth + _0x18d773);
        var _0x282dcc = _0x1af700 * (this.slotHeight + _0x46aada);
        if (_0x4a0011 >= this.slots.length) {
          this.slots[_0x4a0011] = new Slot(
            _0x4a0011,
            _0x5a711e,
            _0x282dcc,
            this,
          );
        } else {
          this.slots[_0x4a0011].x = _0x5a711e;
          this.slots[_0x4a0011].y = _0x282dcc;
          this.slots[_0x4a0011].init();
        }
        _0x4a0011++;
      }
    }
    for (
      this.shownSlots = _0x4a0011;
      _0x4a0011 < this.slots.length;
    ) {
      this.slots[_0x4a0011].hide();
      _0x4a0011++;
    }
    this.resizeElements();
  }
};
GameSlots.prototype.chatMaxH = function () {
  var _0x22e767;
  for (_0x22e767 = 600; _0x22e767 <= 2000; _0x22e767 += 50) {
    if (_0x22e767 - this.realHeight >= 57) {
      return _0x22e767;
    }
  }
  return _0x22e767;
};
GameSlots.prototype.resizeElements = function () {
  var _0x2d7443 = this.resultsShown;
  if (this.rowCount > 1 || this.shownSlots === 1) {
    _0x2d7443 = false;
  }
  var _0x2ef647 =
    this.realHeight + (_0x2d7443 ? this.resultsBox.offsetHeight : 0);
  this.gsDiv.style.height = _0x2ef647 + "px";
  this.lobbyBox.style.height = Math.max(_0x2ef647 + 7, 500) + "px";
  this.resultsBox.style.maxHeight = _0x2ef647 - 5 + 14 + "px";
  if (_0x2d7443) {
    if (this.shownSlots === 1) {
      this.resultsBox.style.maxHeight = "140px";
    } else if (this.shownSlots === 2) {
      this.resultsBox.style.maxHeight = "180px";
    } else {
      this.resultsBox.style.maxHeight = "240px";
    }
  }
  if (!this.chatExpanded) {
    this.chatBox.style.height = this.chatMaxH() - _0x2ef647 + "px";
    this.scrollChatDown();
  }
};
GameSlots.prototype.resetAll = function () {
  for (
    var _0x535c0f = 0;
    _0x535c0f < this.slots.length;
    _0x535c0f++
  ) {
    this.slots[_0x535c0f].vacantClear();
  }
  this.cidSlots = {};
};
GameSlots.prototype.reset = function () {
  for (
    var _0x10e422 = 0;
    _0x10e422 < this.slots.length;
    _0x10e422++
  ) {
    this.slots[_0x10e422].clear();
    this.slots[_0x10e422].slotDiv.classList.remove("np");
  }
};
GameSlots.prototype.setTarget = function (_0x111df4) {
  if (this.targetSlotId !== _0x111df4) {
    if (this.targetSlotId !== -1) {
      this.slots[this.targetSlotId].setIsTargetted(false);
    }
    this.targetSlotId = _0x111df4;
    if (_0x111df4 !== -1) {
      this.slots[_0x111df4].setIsTargetted(true);
    }
  }
};
GameSlots.prototype.CID = function (_0x5c2a9f) {
  return this.slots[this.cidSlots[_0x5c2a9f]];
};
GameSlots.prototype.getSlot = function (_0x477d01, _0x2347c9) {
  var _0x2035dd;
  if (
    (_0x2347c9 === undefined ? null : _0x2347c9) !== null &&
    this.teamMembers[_0x2347c9].indexOf(_0x477d01) === -1
  ) {
    this.teamMembers[_0x2347c9].push(_0x477d01);
  }
  for (_0x2035dd = 0; _0x2035dd < this.slots.length; _0x2035dd++) {
    if (this.slots[_0x2035dd].cid === -1) {
      this.slots[_0x2035dd].cid = _0x477d01;
      this.cidSlots[_0x477d01] = _0x2035dd;
      return true;
    }
  }
  this.slots[_0x2035dd] = new Slot(_0x2035dd, 0, 0, this);
  this.slots[_0x2035dd].cid = _0x477d01;
  this.slots[_0x2035dd].hide();
  this.cidSlots[_0x477d01] = _0x2035dd;
  return true;
};
GameSlots.prototype.chatExpand = function () {
  this.chatExpanded = !this.chatExpanded;
  if (this.chatExpanded) {
    this.gsDiv.style.display = "none";
    this.chatBox.style.height = this.chatMaxH() + "px";
    this.scrollChatDown();
    this.chatExp.setAttribute("data-original-title", "Minify");
  } else {
    this.gsDiv.style.display = "block";
    this.resizeElements();
    this.chatExp.setAttribute("data-original-title", "Expand");
  }
  this.chatExp.classList.toggle("exUp");
  this.chatExp.classList.toggle("exDown");
  if (this.chatExp.hasAttribute("aria-describedby")) {
    let _0x1b5236 = this.chatExp.getAttribute("aria-describedby");
    hideElem(document.getElementById(_0x1b5236));
  }
};
GameSlots.prototype.scrollChatDown = function () {
  var _0x2a6629 = this;
  setTimeout(function () {
    _0x2a6629.chatArea.scrollTop = _0x2a6629.chatArea.scrollHeight;
  }, 0);
};
Slot.prototype.init = function () {
  this.slotDiv.className = "slot";
  this.slotDiv.style.left = this.x + "px";
  this.slotDiv.style.top = this.y + "px";
  this.stageDiv.style.position = "relative";
  this.name.style.width = this.gs.matrixWidth + 2 + "px";
  this.name.style.height = this.gs.nameHeight + "px";
  this.name.style.fontSize = this.gs.nameFontSize + "px";
  this.pCan.width = this.bgCan.width = this.gs.matrixWidth;
  this.pCan.height = this.bgCan.height = this.gs.matrixHeight;
  this.queueCan.width = this.holdCan.width =
    this.gs.holdQueueBlockSize * 4;
  this.holdCan.height = this.gs.holdQueueBlockSize * 4;
  this.queueCan.height = this.gs.holdQueueBlockSize * 15;
  this.pCan.style.top =
    this.bgCan.style.top =
    this.holdCan.style.top =
    this.queueCan.style.top =
      this.gs.nameHeight + "px";
  this.holdCan.style.left = "0px";
  var _0x3c44b1 = this.gs.holdQueueBlockSize * 0.8;
  var _0x14e477 = this.gs.holdQueueBlockSize * 4 + _0x3c44b1;
  this.name.style.left = _0x14e477 + "px";
  this.pCan.style.left = this.bgCan.style.left = _0x14e477 + "px";
  this.queueCan.style.left =
    _0x14e477 + this.pCan.width + _0x3c44b1 + "px";
  if (this.gs.slotStats && this.gs.matrixWidth >= 50) {
    this.stats.init();
    this.stats.statsDiv.style.left = _0x14e477 + "px";
    this.slotDiv.appendChild(this.stats.statsDiv);
    let _0x1e8a73 =
      this.stats.statsDiv.childNodes[0].clientWidth * 1.1;
    let _0x21275a =
      _0x1e8a73 * 2 < this.gs.matrixWidth * 0.85 ||
      _0x1e8a73 > this.gs.matrixWidth * 0.6;
    this.stats.winCounter.style.display = _0x21275a ? null : "none";
  } else {
    this.stats.disable();
  }
  this.slotDiv.appendChild(this.name);
  this.slotDiv.appendChild(this.stageDiv);
  this.stageDiv.appendChild(this.bgCan);
  this.stageDiv.appendChild(this.pCan);
  this.stageDiv.appendChild(this.holdCan);
  this.stageDiv.appendChild(this.queueCan);
  this.slotDiv.style.display = "block";
  this.gs.gsDiv.appendChild(this.slotDiv);
  this.v.onResized();
};
Slot.prototype.clear = function () {
  this.v.clearMainCanvas();
  this.v.clearHoldCanvas();
  this.v.clearQueueCanvas();
};
Slot.prototype.vacantClear = function () {
  delete this.gs.cidSlots[this.cid];
  this.cid = -1;
  this.clear();
  this.setName("");
  this.slotDiv.classList.remove("np");
  this.stats.winCounter.style.display = "none";
  this.stats.winCounter.textContent = "0";
};
Slot.prototype.hide = function () {
  this.slotDiv.style.display = "none";
};
Slot.prototype.setName = function (_0x4d8072) {
  this.name.innerHTML = _0x4d8072;
};
Slot.prototype.setIsTargetted = function (_0x4cf6a0) {
  if (_0x4cf6a0) {
    this.slotDiv.classList.add("target");
  } else {
    this.slotDiv.classList.remove("target");
  }
};
SlotStats.prototype.init = function () {
  this.statsDiv.style.display = "block";
  this.statsDiv.style.top =
    this.gs.nameHeight + this.gs.matrixHeight + "px";
  this.statsDiv.style.height = this.gs.nameHeight + "px";
  var _0x3dbbc5 = Math.min(
    this.gs.nameFontSize,
    Math.floor(this.gs.matrixWidth / 8),
  );
  this.statsDiv.style.fontSize = _0x3dbbc5 + "px";
  let _0x4c8d03 = this.gs.redBarWidth * 2;
  this.statsDiv.style.width = this.gs.matrixWidth + _0x4c8d03 + "px";
  this.winCounter.style.marginRight = _0x4c8d03 - 2 + "px";
};
SlotStats.prototype.disable = function () {
  this.statsDiv.style.display = "none";
};
SlotStats.prototype.update = function (_0x2fa1c3, _0x246082) {
  this.pps.textContent = _0x2fa1c3.toFixed(2);
  this.apm.textContent = _0x246082.toFixed(2);
};
SlotView.prototype.changeSkin = function (_0x212d72, _0x1a99bb) {
  if (_0x212d72 === 7 && _0x1a99bb !== undefined) {
    this.g.monochromeSkin = _0x1a99bb;
    _0x212d72 = 0;
  } else {
    this.g.monochromeSkin = false;
  }
  if (
    _0x212d72 < 1000 &&
    (this.g.skins[_0x212d72] === undefined ||
      !this.g.skins[_0x212d72].data)
  ) {
    _0x212d72 = 0;
  }
  if (_0x212d72 >= 1000 && !this.customSkinPath) {
    console.log("Skin unavailable - " + _0x212d72);
    _0x212d72 = 0;
  }
  if (this.slot.gs.skinOverride) {
    _0x212d72 = 1;
    this.g.skins[1] = this.slot.gs.skinOverride;
  }
  this.skinId = _0x212d72;
  if (_0x212d72 > 0) {
    let _0x7c57e4;
    if (_0x212d72 >= 1000) {
      _0x7c57e4 = "/res/b/" + this.customSkinPath + ".png";
      this.g.skins[_0x212d72] = {
        id: _0x212d72,
        data: _0x7c57e4,
        w: 32,
      };
      this.skinWidth = 32;
    } else {
      _0x7c57e4 = this.g.skins[_0x212d72].data;
      try {
        this.skinWidth = this.g.skins[_0x212d72].w;
      } catch (_0x24bdfa) {
        this.skinWidth = 32;
      }
    }
    this.tex.src = _0x7c57e4;
  }
};
SlotView.prototype.loadResources = function () {};
SlotView.prototype.drawBgGrid = function () {
  var _0xe736d6 =
    this.slot.gs.matrixWidth - this.slot.gs.redBarWidth + 1;
  this.bgctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  this.bgctx.beginPath();
  this.bgctx.lineWidth = 1;
  for (var _0xaa15fe = 1; _0xaa15fe < 10; _0xaa15fe++) {
    this.bgctx.moveTo(_0xaa15fe * this.block_size + 0.5, 0);
    this.bgctx.lineTo(
      _0xaa15fe * this.block_size + 0.5,
      this.canvas.height,
    );
  }
  for (_0xaa15fe = 1; _0xaa15fe < 20; _0xaa15fe++) {
    this.bgctx.moveTo(0, _0xaa15fe * this.block_size + 0.5);
    this.bgctx.lineTo(_0xe736d6, _0xaa15fe * this.block_size + 0.5);
  }
  this.bgctx.strokeStyle =
    this.slot.gs.shownSlots > 6 ? "#0c0c0c" : "#101010";
  this.bgctx.stroke();
  this.bgctx.beginPath();
  for (_0xaa15fe = 0; _0xaa15fe < 9; _0xaa15fe++) {
    for (var _0x4e493a = 1; _0x4e493a < 20; _0x4e493a++) {
      this.bgctx.moveTo(
        _0xaa15fe * this.block_size + this.block_size * 0.75,
        _0x4e493a * this.block_size + 0.5,
      );
      this.bgctx.lineTo(
        (_0xaa15fe + 1) * this.block_size + this.block_size * 0.2,
        _0x4e493a * this.block_size + 0.5,
      );
    }
  }
  for (_0xaa15fe = 0; _0xaa15fe < 19; _0xaa15fe++) {
    for (var _0x1021c9 = 1; _0x1021c9 < 10; _0x1021c9++) {
      this.bgctx.moveTo(
        _0x1021c9 * this.block_size + 0.5,
        _0xaa15fe * this.block_size + this.block_size * 0.75,
      );
      this.bgctx.lineTo(
        _0x1021c9 * this.block_size + 0.5,
        (_0xaa15fe + 1) * this.block_size + this.block_size * 0.2,
      );
    }
  }
  this.bgctx.strokeStyle =
    this.slot.gs.shownSlots > 6 ? "#1c1c1c" : "#202020";
  this.bgctx.stroke();
  this.bgctx.beginPath();
  this.bgctx.strokeStyle = "#393939";
  if (this.slot.gs.rowCount === 1) {
    this.bgctx.lineWidth = 2;
    this.bgctx.strokeRect(
      1,
      1,
      _0xe736d6 - 1,
      this.canvas.height - 2,
    );
  } else {
    this.bgctx.lineWidth = 1;
    this.bgctx.strokeStyle = "#1c1c1c";
    this.drawLine(
      this.bgctx,
      _0xe736d6 - 0.5,
      0,
      _0xe736d6 - 0.5,
      this.slot.gs.matrixHeight,
    );
  }
};
SlotView.prototype.drawGhostAndCurrent = function () {
  if (this.g.activeBlock) {
    var _0x5eb9af = this.g.blockSets[this.g.activeBlock.set];
    var _0x4013c5 =
      _0x5eb9af.scale === 1
        ? _0x5eb9af.blocks[this.g.activeBlock.id].blocks[
            this.g.activeBlock.rot
          ]
        : _0x5eb9af.previewAs.blocks[this.g.activeBlock.id].blocks[
            this.g.activeBlock.rot
          ];
    var _0x260e6d = _0x4013c5.length;
    this.drawScale = _0x5eb9af.scale;
    if (this.ghostEnabled) {
      for (var _0x5738e6 = 0; _0x5738e6 < _0x260e6d; _0x5738e6++) {
        for (var _0x3d8202 = 0; _0x3d8202 < _0x260e6d; _0x3d8202++) {
          if (_0x4013c5[_0x5738e6][_0x3d8202] > 0) {
            this.drawGhostBlock(
              this.g.ghostPiece.pos.x + _0x3d8202 * this.drawScale,
              this.g.ghostPiece.pos.y + _0x5738e6 * this.drawScale,
              _0x5eb9af.blocks[this.g.activeBlock.id].color,
            );
          }
        }
      }
    }
    for (_0x5738e6 = 0; _0x5738e6 < _0x260e6d; _0x5738e6++) {
      for (_0x3d8202 = 0; _0x3d8202 < _0x260e6d; _0x3d8202++) {
        if (_0x4013c5[_0x5738e6][_0x3d8202] > 0) {
          this.drawBlock(
            this.g.activeBlock.pos.x + _0x3d8202 * this.drawScale,
            this.g.activeBlock.pos.y + _0x5738e6 * this.drawScale,
            _0x5eb9af.blocks[this.g.activeBlock.id].color,
          );
        }
      }
    }
    this.drawScale = 1;
  }
};
SlotView.prototype.redraw = function () {
  if (!this.redrawBlocked && this.g) {
    this.clearMainCanvas();
    if (!this.g.isInvisibleSkin) {
      for (var _0x5db26c = 0; _0x5db26c < 20; _0x5db26c++) {
        for (var _0x89783f = 0; _0x89783f < 10; _0x89783f++) {
          this.drawBlock(
            _0x89783f,
            _0x5db26c,
            this.g.matrix[_0x5db26c][_0x89783f],
          );
        }
      }
    }
    this.drawGhostAndCurrent();
    var _0x1469cb =
      this.slot.gs.matrixWidth - this.slot.gs.redBarWidth + 1;
    if (this.g.redBar > 0) {
      this.drawRectangle(
        this.ctx,
        _0x1469cb,
        (20 - this.g.redBar) * this.block_size,
        this.slot.gs.redBarWidth,
        this.g.redBar * this.block_size,
        "#FF270F",
      );
    }
    this.afterRedraw();
  }
};
SlotView.prototype.redrawRedBar = function () {
  this.redraw();
};
SlotView.prototype.clearMainCanvas = function () {
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
};
SlotView.prototype.clearHoldCanvas = function () {
  this.hctx.clearRect(
    0,
    0,
    this.holdCanvas.width,
    this.holdCanvas.height,
  );
};
SlotView.prototype.clearQueueCanvas = function () {
  this.qctx.clearRect(
    0,
    0,
    this.queueCanvas.width,
    this.queueCanvas.height,
  );
};
SlotView.prototype.drawBlockOnCanvas = function (
  _0x2babb3,
  _0x2ac6d9,
  _0x24db98,
  _0x169f59,
  _0x44bb77,
) {
  _0x44bb77 = _0x44bb77 || this.holdQueueBlockSize;
  var _0x54065e = null;
  _0x54065e =
    _0x169f59 === this.MAIN
      ? this.ctx
      : _0x169f59 === this.HOLD
        ? this.hctx
        : this.qctx;
  if (this.skinId === 0) {
    var _0x4b091 =
      this.g.monochromeSkin && _0x24db98 <= 7
        ? this.g.monochromeSkin
        : this.g.colors[_0x24db98];
    this.drawRectangle(
      _0x54065e,
      _0x2babb3 * _0x44bb77,
      _0x2ac6d9 * _0x44bb77,
      _0x44bb77,
      _0x44bb77,
      _0x4b091,
    );
  } else {
    let _0xdfbd92 = this.skinWidth;
    _0x54065e.drawImage(
      this.tex,
      this.g.coffset[_0x24db98] * _0xdfbd92,
      0,
      _0xdfbd92,
      _0xdfbd92,
      _0x2babb3 * _0x44bb77,
      _0x2ac6d9 * _0x44bb77,
      _0x44bb77,
      _0x44bb77,
    );
  }
};
SlotView.prototype.drawBlock = function (
  _0x413a7c,
  _0x339541,
  _0x43c6b3,
) {
  if (
    _0x43c6b3 &&
    _0x413a7c >= 0 &&
    _0x339541 >= 0 &&
    _0x413a7c < 10 &&
    _0x339541 < 20
  ) {
    var _0x2672fa = this.drawScale * this.block_size;
    if (this.skinId) {
      let _0x2a879a = this.skinWidth;
      this.ctx.drawImage(
        this.tex,
        this.g.coffset[_0x43c6b3] * _0x2a879a,
        0,
        _0x2a879a,
        _0x2a879a,
        _0x413a7c * this.block_size,
        _0x339541 * this.block_size,
        _0x2672fa,
        _0x2672fa,
      );
    } else {
      var _0x893b32 =
        this.g.monochromeSkin && _0x43c6b3 <= 7
          ? this.g.monochromeSkin
          : this.g.colors[_0x43c6b3];
      this.drawRectangle(
        this.ctx,
        _0x413a7c * this.block_size,
        _0x339541 * this.block_size,
        _0x2672fa,
        _0x2672fa,
        _0x893b32,
      );
    }
  }
};
SlotView.prototype.drawGhostBlock = function (
  _0x484a4c,
  _0xb0baf1,
  _0x43f831,
) {
  if (
    _0x484a4c >= 0 &&
    _0xb0baf1 >= 0 &&
    _0x484a4c < 10 &&
    _0xb0baf1 < 20
  ) {
    var _0xbf52c5 = this.drawScale * this.block_size;
    if (this.ghostSkinId === 0) {
      this.ctx.globalAlpha = 0.5;
      if (this.skinId > 0) {
        let _0x1eb975 = this.skinWidth;
        this.ctx.drawImage(
          this.tex,
          this.g.coffset[_0x43f831] * _0x1eb975,
          0,
          _0x1eb975,
          _0x1eb975,
          _0x484a4c * this.block_size,
          _0xb0baf1 * this.block_size,
          _0xbf52c5,
          _0xbf52c5,
        );
      } else {
        this.drawBlock(_0x484a4c, _0xb0baf1, _0x43f831);
      }
      this.ctx.globalAlpha = 1;
    } else {
      var _0x1958f1 = this.ghostSkins[this.ghostSkinId];
      this.ctx.drawImage(
        this.ghostTex,
        (this.g.coffset[_0x43f831] - 2) * _0x1958f1.w,
        0,
        _0x1958f1.w,
        _0x1958f1.w,
        _0x484a4c * this.block_size,
        _0xb0baf1 * this.block_size,
        _0xbf52c5,
        _0xbf52c5,
      );
    }
  }
};
SlotView.prototype.drawRectangle = function (
  _0x2b2b0c,
  _0x3926af,
  _0xac797b,
  _0xe2cb08,
  _0x2a4f08,
  _0x468f98,
) {
  _0x2b2b0c.beginPath();
  _0x2b2b0c.rect(_0x3926af, _0xac797b, _0xe2cb08, _0x2a4f08);
  _0x2b2b0c.fillStyle = _0x468f98;
  _0x2b2b0c.fill();
};
SlotView.prototype.drawLine = function (
  _0x6df984,
  _0x12efd1,
  _0x226c5f,
  _0x3ecbd5,
  _0x6781fc,
) {
  _0x6df984.beginPath();
  _0x6df984.moveTo(_0x12efd1, _0x226c5f);
  _0x6df984.lineTo(_0x3ecbd5, _0x6781fc);
  _0x6df984.stroke();
};
SlotView.prototype.paintMatrixWithColor = function (_0x5427e6) {
  for (var _0x4d238b = 0; _0x4d238b < 20; _0x4d238b++) {
    for (var _0x2f991e = 0; _0x2f991e < 10; _0x2f991e++) {
      if (this.g.matrix[_0x4d238b][_0x2f991e] > 0) {
        this.g.matrix[_0x4d238b][_0x2f991e] = _0x5427e6;
      }
    }
  }
};
SlotView.prototype.updateLiveMatrix = function (
  _0x15a261,
  _0x3ea5b9,
) {
  this.clearMainCanvas();
  var _0x48e184 = _0x15a261.length;
  for (var _0x2aee18 = 0; _0x2aee18 < _0x48e184; _0x2aee18++) {
    var _0x4d3a6f = _0x15a261[_0x2aee18].length;
    for (var _0x5e13bf = 0; _0x5e13bf < _0x4d3a6f; _0x5e13bf++) {
      if (_0x15a261[_0x2aee18][_0x5e13bf] > 0) {
        this.drawBlockOnCanvas(
          _0x5e13bf,
          _0x2aee18,
          _0x15a261[_0x2aee18][_0x5e13bf],
          this.MAIN,
          this.slot.gs.liveBlockSize,
        );
      }
    }
  }
  var _0x4ad455 =
    this.slot.gs.matrixWidth - this.slot.gs.redBarWidth + 1;
  this.drawLine(
    this.ctx,
    _0x4ad455,
    0,
    _0x4ad455,
    this.slot.gs.matrixHeight,
  );
  this.drawRectangle(
    this.ctx,
    _0x4ad455,
    0,
    this.slot.gs.redBarWidth,
    this.slot.gs.matrixHeight,
    "black",
  );
  if (_0x3ea5b9 > 0) {
    this.drawRectangle(
      this.ctx,
      _0x4ad455,
      (20 - _0x3ea5b9) * this.slot.gs.liveBlockSize,
      this.slot.gs.redBarWidth,
      _0x3ea5b9 * this.slot.gs.liveBlockSize,
      "#FF270F",
    );
  }
  this.afterRedraw();
};
SlotView.prototype.updateTextBar = function () {
  if (this.slot.gs.slotStats) {
    var _0x29b597 = this.slot.gs.p.timestamp() - this.restartedAt;
    var _0x4875de =
      Math.round((this.g.placedBlocks * 100) / (_0x29b597 / 1000)) /
      100;
    var _0x43afc9 =
      Math.round(
        (this.g.gamedata.linesSent * 100) / (_0x29b597 / 60000),
      ) / 100;
    this.slot.stats.update(_0x4875de, _0x43afc9);
  }
};
SlotView.prototype.onCreate = function () {};
SlotView.prototype.onReady = function () {
  this.g.updateQueueBox();
  this.g.redrawHoldBox();
  this.clearMainCanvas();
};
SlotView.prototype.onRestart = function () {
  this.g.redrawHoldBox();
  this.redraw();
  this.restartedAt = this.slot.gs.p.timestamp();
  if (this.slot.gs.slotStats) {
    this.slot.stats.update(0, 0);
  }
};
SlotView.prototype.onBlockHold = function () {
  this.g.redrawHoldBox();
  this.redraw();
};
SlotView.prototype.onBlockMove = function (_0x33d511) {
  this.redraw();
};
SlotView.prototype.onFinesseChange = function () {};
SlotView.prototype.onGameOver = function () {
  this.paintMatrixWithColor(9);
};
SlotView.prototype.onBlockLocked = function () {};
SlotView.prototype.onLinesCleared = function () {};
SlotView.prototype.onScoreChanged = function () {};
SlotView.prototype.onResized = function () {
  this.block_size = this.slot.gs.liveBlockSize;
  this.holdQueueBlockSize = this.slot.gs.holdQueueBlockSize;
  this.drawBgGrid();
  this.clearMainCanvas();
  if (this.slot.gs.isExtended) {
    this.QueueHoldEnabled = true;
    this.holdCanvas.style.display = "block";
    this.queueCanvas.style.display = "block";
  } else {
    this.QueueHoldEnabled = false;
    this.holdCanvas.style.display = "none";
    this.queueCanvas.style.display = "none";
  }
};
SlotView.prototype.printTextBg = function () {
  this.ctx.save();
  this.ctx.globalAlpha = 0.8;
  this.ctx.beginPath();
  var _0x507483 =
    this.slot.gs.shownSlots === 1
      ? this.slot.gs.matrixHeight * 0.35
      : this.slot.gs.matrixHeight * 0.65;
  this.ctx.rect(
    0,
    Math.round(_0x507483),
    this.slot.gs.matrixWidth,
    Math.round(this.slot.gs.matrixHeight / 5.7),
  );
  this.ctx.fillStyle = "#090909";
  this.ctx.fill();
  this.ctx.restore();
};
SlotView.prototype.printSlotPlace = function (_0x5ec819) {
  var _0x108905 = this.slot.gs.p.getPlaceColor(_0x5ec819);
  this.printTextBg();
  this.ctx.fillStyle = _0x108905.color;
  var _0x3cc637 = Math.round(this.slot.gs.matrixHeight / 10);
  this.ctx.font = "bold " + _0x3cc637 + 'px "Exo 2"';
  this.ctx.textAlign = "center";
  var _0x1bbb9a =
    this.slot.gs.shownSlots === 1
      ? this.slot.gs.matrixHeight * 0.47
      : this.slot.gs.matrixHeight * 0.77;
  this.ctx.fillText(
    _0x108905.str,
    Math.round(this.slot.gs.matrixWidth / 2),
    Math.round(_0x1bbb9a),
  );
};
SlotView.prototype.printSlotNotPlaying = function () {
  this.printTextBg();
  this.ctx.fillStyle = "#999999";
  var _0xc3640b = Math.round(this.slot.gs.matrixHeight / 12);
  this.ctx.font = "bold " + _0xc3640b + 'px "Exo 2"';
  this.ctx.textAlign = "center";
  var _0x4a13ac =
    this.slot.gs.shownSlots === 1
      ? this.slot.gs.matrixHeight * 0.475
      : this.slot.gs.matrixHeight * 0.77;
  this.ctx.fillText(
    i18n.notPlaying,
    Math.round(this.slot.gs.matrixWidth / 2),
    Math.round(_0x4a13ac),
  );
};
SlotView.prototype.printSlotKO = function () {
  this.printTextBg();
  this.ctx.fillStyle = "#999999";
  var _0x308b7e = Math.round(this.slot.gs.matrixHeight / 12);
  this.ctx.font = "bold " + _0x308b7e + 'px "Exo 2"';
  this.ctx.textAlign = "center";
  var _0x2a331 =
    this.slot.gs.shownSlots === 1
      ? this.slot.gs.matrixHeight * 0.475
      : this.slot.gs.matrixHeight * 0.77;
  this.ctx.fillText(
    "KO'd",
    Math.round(this.slot.gs.matrixWidth / 2),
    Math.round(_0x2a331),
  );
};
SlotView.prototype.afterRedraw = function () {
  var _0x4e576f = this.slot.gs.p.Live.places;
  if (this.slot.cid in _0x4e576f) {
    if (_0x4e576f[this.slot.cid]) {
      this.printSlotPlace(_0x4e576f[this.slot.cid]);
    } else {
      this.printSlotNotPlaying();
    }
  } else if (this.isKO) {
    if (this.KOplace !== null) {
      this.printSlotPlace(this.KOplace);
    } else {
      this.printSlotKO();
    }
  }
};
StatsManager.prototype.setView = function (_0x3b18a9) {
  this.view = _0x3b18a9;
  this.ff = _0x3b18a9.createFastFont();
  this.ff.init(this.render.bind(this));
};
StatsManager.prototype.adjustToGameMode = function () {
  this.resetAll();
  this.applyShownStats(
    this.view.g.Settings.shownStats[this.view.g.isPmode(false)],
  );
  this.render();
};
StatsManager.prototype.initDefault = function (_0x2949fb) {
  this.addStat(new StatLine("CLOCK", i18n.roundTime, 0), false);
  this.addStat(new StatLine("SCORE", i18n.score, 10), false);
  this.addStat(new StatLine("LINES", "Lines", 15), false);
  this.addStat(new StatLine("ATTACK", i18n.attack, 20), false);
  this.addStat(new StatLine("RECV", i18n.received, 30), false);
  this.addStat(new StatLine("FINESSE", i18n.finesse, 40), false);
  this.addStat(new StatLine("PPS", i18n.PPS, 50), false);
  this.addStat(new StatLine("KPP", i18n.KPP, 60), false);
  this.addStat(new StatLine("APM", i18n.APM, 70), false);
  this.addStat(new StatLine("BLOCKS", "#", 80), false);
  this.addStat(new StatLine("VS", "VS", 90), false);
  this.addStat(new StatLine("WASTE", "Wasted", 100), false);
  this.addStat(new StatLine("HOLD", "Hold", 110), false);
  this.get("CLOCK").initialVal = "0.00";
  this.applyShownStats(this.shown);
  this.reorder();
};
StatsManager.prototype.applyShownStats = function (_0x2127c1) {
  var _0x2840ca = Object.keys(this.stats);
  for (var _0x6f9eae = 0; _0x6f9eae < _0x2840ca.length; _0x6f9eae++) {
    if (_0x2127c1 & (1 << _0x6f9eae)) {
      this.get(_0x2840ca[_0x6f9eae]).enable();
    } else {
      this.get(_0x2840ca[_0x6f9eae]).disable();
    }
  }
};
StatsManager.prototype.get = function (_0x4dc819) {
  return this.stats[_0x4dc819];
};
StatsManager.prototype.render = function () {
  this.ff.renderLines(this.ordered);
  this.dirty = false;
};
StatsManager.prototype.addStat = function (_0x28b646, _0x52da4a) {
  if (!(_0x28b646.id in this.stats)) {
    this.stats[_0x28b646.id] = _0x28b646;
    _0x28b646.manager = this;
    _0x28b646.enabled = true;
    if (_0x52da4a) {
      this.reorder();
    }
  }
};
StatsManager.prototype.reorder = function () {
  this.ordered.length;
  this.ordered = Object.values(this.stats);
  for (
    this.ordered.sort((_0x50ebdb, _0x3d02fa) =>
      _0x50ebdb.enabled
        ? _0x3d02fa.enabled
          ? _0x50ebdb.order > _0x3d02fa.order
            ? 1
            : _0x3d02fa.order > _0x50ebdb.order
              ? -1
              : 0
          : -1
        : 1,
    );
    this.ordered.length &&
    !this.ordered[this.ordered.length - 1].enabled;
  ) {
    this.ordered.pop();
  }
  while (this.labelsElem.firstChild) {
    this.labelsElem.removeChild(this.labelsElem.firstChild);
  }
  for (
    var _0x478110 = 0;
    _0x478110 < this.ordered.length;
    ++_0x478110
  ) {
    if (this.ordered[_0x478110].enabled) {
      this.labelsElem.appendChild(this.ordered[_0x478110].label);
    }
  }
};
StatsManager.prototype.resetAll = function () {
  for (var _0x11bfe5 in this.stats) {
    this.stats[_0x11bfe5].reset();
  }
  this.dirty = true;
};
StatLine.prototype.set = function (_0x5174a7) {
  if (_0x5174a7 !== this.value) {
    this.value = _0x5174a7;
    if (this.enabled) {
      this.manager.dirty = true;
    }
  }
  return this;
};
StatLine.prototype.enable = function () {
  this.enabled = true;
  this.label.style.display = null;
  return this;
};
StatLine.prototype.disable = function () {
  if (!this.locked) {
    this.enabled = false;
    hideElem(this.label);
  }
  return this;
};
StatLine.prototype.reset = function () {
  if (this.resets) {
    this.value = this.initialVal;
    return this;
  } else {
    return this;
  }
};
StatLine.prototype.setLock = function (_0xe71719) {
  this.locked = _0xe71719;
  return this;
};
StatLine.prototype.setOrder = function (_0x49d05e) {
  this.order = _0x49d05e;
  return this;
};
GameCaption.prototype.create = function () {
  var _0x536bb4 = document.createElement("div");
  this.parent.appendChild(_0x536bb4);
  _0x536bb4.style.width = "242px";
  _0x536bb4.classList.add("gCapt");
  return _0x536bb4;
};
GameCaption.prototype.hide = function (_0x1288d3) {
  if (_0x1288d3 === undefined) {
    for (var _0x3a4b20 in this.captions) {
      this.captions[_0x3a4b20].style.display = "none";
    }
  } else if (_0x1288d3 in this.captions) {
    this.captions[_0x1288d3].style.display = "none";
  }
};
GameCaption.prototype.hideExcept = function (_0x3f29b7) {
  for (var _0x41b128 in this.captions) {
    if (_0x41b128 != _0x3f29b7) {
      this.captions[_0x41b128].style.display = "none";
    }
  }
};
GameCaption.prototype.spectatorMode = function () {
  this.hide();
  if (this.SPECTATOR_MODE in this.captions) {
    this.captions[this.SPECTATOR_MODE].style.display = "block";
  } else {
    var _0x100d6e = (this.captions[this.SPECTATOR_MODE] =
      this.create());
    _0x100d6e.style.top = "288px";
    _0x100d6e.style.height = "73px";
    _0x100d6e.style.color = "#CBD600";
    var _0x4eab04 = document.createElement("div");
    var _0x565460 = document.createElement("div");
    _0x4eab04.textContent = i18n.specMode;
    _0x4eab04.style.fontSize = "22px";
    _0x4eab04.style.marginTop = "7px";
    _0x565460.textContent = i18n.endSpec;
    _0x565460.style.fontSize = "15px";
    _0x565460.style.marginTop = "7px";
    _0x100d6e.appendChild(_0x4eab04);
    _0x100d6e.appendChild(_0x565460);
  }
};
GameCaption.prototype.outOfFocus = function (_0x1ad90d) {
  if (
    this.GAME_PLACE in this.captions &&
    this.captions[this.GAME_PLACE].style.display === "block"
  ) {
    return;
  }
  if (this.OUT_OF_FOCUS in this.captions) {
    this.captions[this.OUT_OF_FOCUS].style.display = "block";
    return;
  }
  var _0x5b0ea0 = (this.captions[this.OUT_OF_FOCUS] = this.create());
  let _0x5c6a40 = 168;
  if (_0x1ad90d && _0x1ad90d.top) {
    _0x5c6a40 = _0x1ad90d.top;
  }
  _0x5b0ea0.style.top = _0x5c6a40 + "px";
  _0x5b0ea0.style.height = "97px";
  _0x5b0ea0.style.color = "#CBD600";
  var _0x28e5ea = document.createElement("div");
  var _0x172a8c = document.createElement("div");
  _0x28e5ea.textContent = i18n.notFocused;
  _0x28e5ea.style.fontSize = "30px";
  _0x28e5ea.style.marginTop = "11px";
  _0x172a8c.textContent = i18n.clickToFocus;
  _0x172a8c.style.fontSize = "16px";
  _0x172a8c.style.marginTop = "7px";
  _0x5b0ea0.appendChild(_0x28e5ea);
  _0x5b0ea0.appendChild(_0x172a8c);
};
GameCaption.prototype.readyGo = function (_0x1eba28) {
  var _0x2d502d;
  this.hideExcept(this.MODE_INFO);
  if (this.READY_GO in this.captions) {
    this.captions[this.READY_GO].style.display = "block";
  } else {
    (_0x2d502d = this.captions[this.READY_GO] =
      this.create()).style.opacity = 1;
    _0x2d502d.style.top = "264px";
    _0x2d502d.style.height = "73px";
    _0x2d502d.style.color = "#CBD600";
    _0x2d502d.style.fontWeight = "bold";
  }
  (_0x2d502d = this.captions[this.READY_GO]).textContent = "";
  var _0x1fd887 = document.createElement("div");
  _0x1fd887.style.fontSize = "31px";
  _0x1fd887.style.marginTop = "15px";
  _0x1fd887.textContent = _0x1eba28 === 0 ? i18n.ready : i18n.go;
  _0x2d502d.appendChild(_0x1fd887);
};
GameCaption.prototype.modeInfo = function (_0x1aaecd, _0x22d0c5) {
  if (_0x1aaecd != "") {
    var _0x1d9f3d;
    if (this.MODE_INFO in this.captions) {
      this.captions[this.MODE_INFO].style.display = "block";
    } else {
      (_0x1d9f3d = this.captions[this.MODE_INFO] =
        this.create()).style.opacity = 1;
      _0x1d9f3d.style.top = "90px";
      _0x1d9f3d.style.color = "rgb(107 180 255)";
      _0x1d9f3d.style.fontWeight = "bold";
    }
    (_0x1d9f3d = this.captions[this.MODE_INFO]).textContent = "";
    _0x1d9f3d.style.top = "90px";
    if (_0x22d0c5.t == 0) {
      var _0x1aaba9 = document.createElement("div");
      _0x1aaba9.style.fontSize = "20px";
      _0x1aaba9.style.marginTop = "15px";
      _0x1aaba9.textContent = "TASK:";
      _0x1aaba9.style.color = "#CBD600";
      _0x1d9f3d.appendChild(_0x1aaba9);
    }
    var _0x4e87a5 = document.createElement("div");
    _0x4e87a5.style.fontSize = "19px";
    _0x4e87a5.style.marginTop = "4px";
    _0x4e87a5.style.marginBottom = "15px";
    _0x4e87a5.innerHTML = _0x1aaecd;
    _0x1d9f3d.appendChild(_0x4e87a5);
    if (_0x22d0c5.t == 1) {
      _0x1d9f3d.style.top = "236px";
      _0x4e87a5.style.marginBottom = "5px";
      _0x1d9f3d.classList.add("transitionCaption");
      this._fadeOut(_0x1d9f3d, 4000);
      _0x4e87a5.style.color = "yellow";
    }
  } else {
    this.hide(this.MODE_INFO);
  }
};
GameCaption.prototype.modeComplete = function (_0x201ca1) {
  var _0x12edd6;
  this.hide();
  if (this.MODE_COMPLETE in this.captions) {
    this.captions[this.MODE_COMPLETE].style.display = "block";
  } else {
    (_0x12edd6 = this.captions[this.MODE_COMPLETE] =
      this.create()).style.opacity = 1;
    _0x12edd6.style.top = "272px";
    _0x12edd6.style.color = "#00db00";
  }
  (_0x12edd6 = this.captions[this.MODE_COMPLETE]).textContent = "";
  var _0xb338a4 = document.createElement("div");
  _0xb338a4.style.fontSize = "27px";
  _0xb338a4.style.marginTop = "15px";
  _0xb338a4.style.marginBottom = "15px";
  if (_0x201ca1) {
    if (_0x201ca1 === 1) {
      _0xb338a4.innerHTML = "✔ All done! Nice.";
    }
  } else {
    _0xb338a4.innerHTML = "✔ Completed";
  }
  _0x12edd6.appendChild(_0xb338a4);
  _0xb338a4.classList.add("fadeInTop");
};
GameCaption.prototype.paused = function (_0x1b5bc1) {
  var _0x316046;
  if (this.PAUSED in this.captions) {
    this.captions[this.PAUSED].style.display = "block";
  } else {
    (_0x316046 = this.captions[this.PAUSED] =
      this.create()).style.opacity = 1;
    _0x316046.style.top = "387px";
    _0x316046.style.color = "white";
    _0x316046.style.backgroundColor = null;
  }
  (_0x316046 = this.captions[this.PAUSED]).textContent = "";
  var _0x6817d3 = document.createElement("div");
  _0x6817d3.style.fontSize = "20px";
  _0x6817d3.style.marginTop = "4px";
  _0x6817d3.style.marginBottom = "15px";
  _0x6817d3.className = "pausedSign";
  _0x6817d3.innerHTML = "PAUSED";
  _0x316046.appendChild(_0x6817d3);
  _0x6817d3.classList.add("fadeIn");
  if (_0x1b5bc1.skip) {
    var _0x2eaec0 = document.createElement("div");
    _0x2eaec0.style.marginBottom = "4px";
    _0x2eaec0.style.fontSize = "13px";
    _0x2eaec0.textContent = "Any key to resume";
    _0x6817d3.appendChild(_0x2eaec0);
  }
  if (_0x1b5bc1.sec) {
    var _0x516e03 = document.createElement("div");
    _0x516e03.className = "pauseProg";
    _0x516e03.style.animationDuration =
      Math.round(_0x1b5bc1.sec).toFixed(1) + "s";
    _0x6817d3.appendChild(_0x516e03);
  }
};
GameCaption.prototype.mapLoading = function (_0x1c29ad) {
  var _0x13155c;
  this.hide();
  if (this.MAP_LOADING in this.captions) {
    this.captions[this.MAP_LOADING].style.display = "block";
  } else {
    (_0x13155c = this.captions[this.MAP_LOADING] =
      this.create()).style.opacity = 1;
    _0x13155c.style.top = "266px";
    _0x13155c.style.height = "69px";
    _0x13155c.style.color = "white";
  }
  (_0x13155c = this.captions[this.MAP_LOADING]).textContent = "";
  var _0x43bee0 = document.createElement("img");
  _0x43bee0.src = CDN_URL("/res/svg/spinWhite.svg");
  _0x43bee0.style.width = "30px";
  _0x43bee0.style.marginTop = "5px";
  _0x13155c.appendChild(_0x43bee0);
  var _0x5519ab = document.createElement("div");
  _0x5519ab.style.fontSize = "22px";
  _0x5519ab.style.marginTop = "1px";
  _0x5519ab.innerHTML = _0x1c29ad
    ? _0x1c29ad === 2
      ? "Waiting for players..."
      : "Custom mode loading"
    : i18n.mapLoading;
  _0x13155c.appendChild(_0x5519ab);
};
GameCaption.prototype.button = function (_0x5d5011) {
  var _0x35e155;
  if (this.BUTTON in this.captions) {
    this.captions[this.BUTTON].style.display = "block";
  } else {
    (_0x35e155 = this.captions[this.BUTTON] =
      this.create()).style.opacity = 1;
    _0x35e155.style.top = "372px";
    _0x35e155.style.height = "59px";
    _0x35e155.style.color = "white";
  }
  (_0x35e155 = this.captions[this.BUTTON]).innerHTML = "";
  var _0x9a46ce = document.createElement("a");
  _0x9a46ce.href = "javascript:void(0);";
  _0x9a46ce.style.marginTop = "8px";
  _0x9a46ce.classList.add("btnNX2", "btnNX-lrg", "green");
  _0x9a46ce.innerHTML = "NEXT";
  if (_0x5d5011.handler) {
    _0x9a46ce.addEventListener("click", _0x5d5011.handler);
  }
  _0x35e155.appendChild(_0x9a46ce);
};
GameCaption.prototype.gamePlace = function (_0x20e87a) {
  this.hide(this.OUT_OF_FOCUS);
  this.hide(this.SPEED_LIMIT);
  if (this.GAME_PLACE in this.captions) {
    this.captions[this.GAME_PLACE].style.display = "block";
    this.captions[this.GAME_PLACE].textContent = "";
  } else {
    (_0x1e17f3 = this.captions[this.GAME_PLACE] =
      this.create()).style.opacity = 0.91;
    _0x1e17f3.style.top = "168px";
    _0x1e17f3.style.height = "97px";
    _0x1e17f3.style.color = "#CBD600";
    _0x1e17f3.style.fontWeight = "bold";
  }
  var _0x1e17f3 = this.captions[this.GAME_PLACE];
  var _0x30cd32 = _0x20e87a.getPlaceColor(_0x20e87a.place);
  var _0x3ad70f = document.createElement("div");
  var _0x2c01da = document.createElement("div");
  _0x3ad70f.textContent = _0x30cd32.str;
  _0x3ad70f.style.fontSize = "32px";
  _0x3ad70f.style.marginTop = "11px";
  _0x3ad70f.style.color = _0x30cd32.color;
  _0x2c01da.style.fontSize = "16px";
  _0x2c01da.style.marginTop = "7px";
  if (_0x20e87a.Live.LiveGameRunning) {
    _0x2c01da.style.color = "white";
    _0x2c01da.textContent = i18n.waitNext;
  } else {
    _0x2c01da.style.color = "yellow";
    _0x2c01da.style.fontWeight = "bold";
    _0x2c01da.textContent = i18n.pressStart;
  }
  _0x1e17f3.appendChild(_0x3ad70f);
  _0x1e17f3.appendChild(_0x2c01da);
};
GameCaption.prototype.speedWarning = function (_0x413753) {
  if (
    !(this.GAME_PLACE in this.captions) ||
    this.captions[this.GAME_PLACE].style.display !== "block"
  ) {
    if (this.SPEED_LIMIT in this.captions) {
      this.captions[this.SPEED_LIMIT].style.display = "block";
    } else {
      (_0x3d3523 = this.captions[this.SPEED_LIMIT] =
        this.create()).style.top = "216px";
      _0x3d3523.style.height = "97px";
      _0x3d3523.style.backgroundColor = "red";
      _0x3d3523.style.fontWeight = "bold";
      _0x3d3523.classList.add("transitionCaption");
      var _0x79e900 = document.createElement("div");
      _0x79e900.style.fontSize = "31px";
      _0x79e900.style.marginTop = "15px";
      _0x79e900.style.color = "white";
      _0x79e900.textContent = i18n.slowDown;
      _0x3d3523.appendChild(_0x79e900);
      var _0x1b8533 = document.createElement("div");
      _0x1b8533.id = "slSubT";
      _0x1b8533.style.fontSize = "16px";
      _0x1b8533.style.marginTop = "7px";
      _0x1b8533.style.color = "white";
      _0x1b8533.style.fontWeight = "normal";
      _0x3d3523.appendChild(_0x1b8533);
    }
    var _0x3d3523;
    (_0x3d3523 =
      this.captions[this.SPEED_LIMIT]).getElementsByTagName(
      "div",
    )[1].innerHTML =
      i18n.speedLimitIs + " <b>" + _0x413753.toFixed(1) + "</b> PPS";
    if (this.speedTimout) {
      window.clearTimeout(this.speedTimout);
    }
    this._fadeOut(_0x3d3523, 300);
  }
};
GameCaption.prototype._fadeOut = function (
  _0x22666c,
  _0x5a5f7c,
  _0x5dda65 = null,
  _0x53aa38 = 1,
) {
  _0x22666c.classList.remove("transitionCaption");
  _0x22666c.classList.add("noTransition");
  _0x22666c.style.opacity = _0x53aa38;
  var _0x65cd5b = this;
  this.speedTimout = window.setTimeout(function () {
    _0x22666c.classList.remove("noTransition");
    _0x22666c.classList.add("transitionCaption");
    if (_0x5dda65 !== null) {
      _0x22666c.style.transition = "all " + _0x5dda65 + "s ease-out";
    }
    _0x22666c.style.opacity = 0;
    _0x65cd5b.speedTimout = null;
  }, _0x5a5f7c);
};
GameCaption.prototype.newPB = function (_0x5a7b49) {
  this.hide();
  if (this.NEW_PERSONAL_BEST in this.captions) {
    this.captions[this.NEW_PERSONAL_BEST].style.display = "block";
  } else {
    (_0x2d20f6 = this.captions[this.NEW_PERSONAL_BEST] =
      this.create()).style.opacity = 1;
    _0x2d20f6.style.top = "168px";
    _0x2d20f6.style.paddingTop = "11px";
    _0x2d20f6.classList.add("transitionCaption");
    var _0x3fe5ab = document.createElement("div");
    _0x3fe5ab.style.fontSize = "40px";
    _0x3fe5ab.style.fontWeight = "bold";
    _0x3fe5ab.style.color = "#fafad2";
    _0x2d20f6.appendChild(_0x3fe5ab);
    var _0x55f66f = document.createElement("div");
    _0x55f66f.style.fontSize = "31px";
    _0x55f66f.style.marginTop = "4px";
    _0x55f66f.style.color = "yellow";
    _0x55f66f.textContent = i18n.newPB;
    _0x2d20f6.appendChild(_0x55f66f);
    var _0x4bfb20 = document.createElement("div");
    _0x4bfb20.id = "slSubT";
    _0x4bfb20.style.fontSize = "16px";
    _0x4bfb20.style.marginTop = "12px";
    _0x4bfb20.style.color = "white";
    _0x4bfb20.style.fontWeight = "normal";
    _0x2d20f6.appendChild(_0x4bfb20);
    var _0x391fc0 = document.createElement("div");
    _0x391fc0.className = "gCapt";
    let _0x3e1bd8 = _0x391fc0.style;
    _0x3e1bd8.fontSize = "14px";
    _0x3e1bd8.marginTop = "14px";
    _0x3e1bd8.opacity = "1";
    _0x3e1bd8.position = "initial";
    _0x3e1bd8.paddingBottom = "11px";
    _0x3e1bd8.color = "grey";
    _0x2d20f6.appendChild(_0x391fc0);
  }
  var _0x2d20f6 = this.captions[this.NEW_PERSONAL_BEST];
  if (_0x5a7b49 === true) {
    _0x2d20f6.style.height = "184px";
    _0x2d20f6.style.top = "168px";
    _0x2d20f6.getElementsByTagName("div")[2].textContent =
      i18n.firstPB;
    hideElem(_0x2d20f6.getElementsByTagName("div")[0]);
    hideElem(_0x2d20f6.getElementsByTagName("div")[3]);
  } else if (_0x5a7b49) {
    _0x2d20f6.style.height = "235px";
    _0x2d20f6.style.top = "142px";
    _0x2d20f6.getElementsByTagName("div")[0].innerHTML =
      _0x5a7b49.newS;
    let _0x51c2d0 = {
      prevPB: "<b>" + _0x5a7b49.prevS + "</b>",
      prevAgo: "<b>" + _0x5a7b49.days + " " + i18n.daysAgo + "</b>",
      PBdiff: "<b>" + _0x5a7b49.diffS + "</b>",
    };
    _0x2d20f6.getElementsByTagName("div")[2].innerHTML = trans(
      i18n.infoPB,
      _0x51c2d0,
    );
    _0x2d20f6.getElementsByTagName("div")[3].innerHTML =
      _0x5a7b49.modeTitle;
    showElem(_0x2d20f6.getElementsByTagName("div")[0]);
    showElem(_0x2d20f6.getElementsByTagName("div")[3]);
  }
};
GameCaption.prototype.loading = function (_0x32b618, _0x19bba0) {
  var _0x5a0680;
  this.hide();
  if (this.LOADING in this.captions) {
    this.captions[this.LOADING].style.display = "block";
  } else {
    (_0x5a0680 = this.captions[this.LOADING] =
      this.create()).style.opacity = 1;
    _0x5a0680.style.top = "214px";
    _0x5a0680.style.height = "125px";
    _0x5a0680.style.color = "white";
  }
  (_0x5a0680 = this.captions[this.LOADING]).textContent = "";
  var _0x5d1e5d = document.createElement("img");
  if (_0x19bba0) {
    if (_0x19bba0 === 1) {
      _0x5d1e5d.src = CDN_URL("/res/svg/cancel.svg");
    } else if (_0x19bba0 === 2) {
      _0x5d1e5d.src = CDN_URL("/res/img/i/troll.png");
    }
  } else {
    _0x5d1e5d.src = CDN_URL("/res/svg/spinWhite.svg");
  }
  _0x5d1e5d.style.width = "60px";
  _0x5d1e5d.style.marginTop = "15px";
  _0x5a0680.appendChild(_0x5d1e5d);
  var _0x356a7a = document.createElement("div");
  _0x356a7a.style.fontSize = "22px";
  _0x356a7a.style.marginTop = "6px";
  _0x356a7a.innerHTML = _0x32b618;
  _0x5a0680.appendChild(_0x356a7a);
};
GameCaption.prototype.liveRaceFinished = function () {
  if (this.RACE_FINISHED in this.captions) {
    this.captions[this.RACE_FINISHED].style.display = "block";
    this._fadeOut(this.captions[this.RACE_FINISHED], 5000, 3, 0.85);
    return;
  }
  var _0x555ead = (this.captions[this.RACE_FINISHED] = this.create());
  _0x555ead.style.top = "174px";
  _0x555ead.style.height = "63px";
  _0x555ead.style.color = "#CBD600";
  var _0x2e358d = document.createElement("div");
  var _0x4ce843 = document.createElement("div");
  _0x2e358d.textContent = i18n.raceFin;
  _0x2e358d.style.color = "yellow";
  _0x2e358d.style.fontSize = "19px";
  _0x2e358d.style.marginTop = "4px";
  _0x4ce843.textContent = i18n.raceFinInfo;
  _0x4ce843.style.fontSize = "12px";
  _0x4ce843.style.marginTop = "1px";
  _0x555ead.appendChild(_0x2e358d);
  _0x555ead.appendChild(_0x4ce843);
  this._fadeOut(_0x555ead, 5000, 3, 0.85);
};
GameCaption.prototype.gameWarning = function (
  _0x212022,
  _0x5d805b,
  _0x8132e,
) {
  var _0x58cd67 = 3000;
  if (_0x8132e && _0x8132e.fade_after) {
    _0x58cd67 = _0x8132e.fade_after;
  }
  if (_0x5d805b === undefined) {
    _0x5d805b = "";
  }
  if (this.GAME_WARNING in this.captions) {
    this.captions[this.GAME_WARNING].style.display = "block";
    this.captions[this.GAME_WARNING].getElementsByTagName(
      "div",
    )[0].innerHTML = _0x212022;
    this.captions[this.GAME_WARNING].getElementsByTagName(
      "div",
    )[1].innerHTML = _0x5d805b;
    this._fadeOut(
      this.captions[this.GAME_WARNING],
      _0x58cd67,
      2,
      0.85,
    );
    return;
  }
  var _0x26bf4a = (this.captions[this.GAME_WARNING] = this.create());
  _0x26bf4a.style.top = "216px";
  _0x26bf4a.style.paddingBottom = "15px";
  _0x26bf4a.style.backgroundColor = "red";
  _0x26bf4a.style.fontWeight = "bold";
  _0x26bf4a.classList.add("transitionCaption");
  var _0x5aeb7c = document.createElement("div");
  _0x5aeb7c.style.fontSize = "31px";
  _0x5aeb7c.style.marginTop = "15px";
  _0x5aeb7c.style.color = "white";
  _0x5aeb7c.innerHTML = _0x212022;
  _0x26bf4a.appendChild(_0x5aeb7c);
  var _0x4c5e7f = document.createElement("div");
  _0x4c5e7f.id = "slSubT";
  _0x4c5e7f.style.fontSize = "16px";
  _0x4c5e7f.style.marginTop = "7px";
  _0x4c5e7f.style.color = "white";
  _0x4c5e7f.style.fontWeight = "normal";
  _0x4c5e7f.style.padding = "0px 6px";
  _0x4c5e7f.innerHTML = _0x5d805b;
  _0x26bf4a.appendChild(_0x4c5e7f);
  this._fadeOut(_0x26bf4a, _0x58cd67, 2, 0.85);
};
Mobile.prototype.isMobile = function () {
  let _0x47d498 = localStorage.getItem("mobile");
  if (_0x47d498 !== null) {
    return _0x47d498 !== "false" && _0x47d498;
  } else {
    return this.isMobileDetect();
  }
};
Mobile.prototype.isMobileDetect = function () {
  let _0x585b44 =
    navigator.userAgent || navigator.vendor || window.opera;
  return (
    /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(
      _0x585b44,
    ) ||
    /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
      _0x585b44.substr(0, 4),
    )
  );
};
Mobile.prototype.changeStyle = function () {
  document
    .querySelector("meta[name=viewport]")
    .setAttribute("content", "width=500, user-scalable=0");
  $(".players").hide();
  $(".players").css("margin-left", "22px");
  $(".navbar-brand").attr("href", "javascript:void(0)");
  $("#main").css("float", "none");
  $("#main").css("margin-right", "auto");
  $("#main").css("margin-left", "auto");
  $("#gameFrame").css("width", "auto");
  $("#gc").css("padding", "0");
  $("html").css("width", "500px");
  $(".navbar").css("margin-bottom", "0");
  $("#gameFrame").css("margin-top", "10px");
  $("#gstats").css("padding-top", "10px");
  $("#tcc").addClass("tc").show();
  $("#touchBtn").parent().parent().show();
  $("#touchBtnMove").parent().parent().show();
  $("#touch").prop("checked", true);
  $("#touchBtn").prop("checked", true);
  $("#touchBtnMove").prop("checked", false);
  $("#app").css("touch-action", "manipulation");
};
Mobile.prototype.initForMobile = function () {
  var _0x40225d = this;
  function _0x307f8d(_0x2a76bb) {
    if (!_0x40225d.draggingEnabled) {
      _0x2a76bb.preventDefault();
      _0x2a76bb.stopPropagation();
    }
  }
  function _0x4801fe(_0x5d05b7) {
    if (!_0x40225d.draggingEnabled) {
      _0x5d05b7.preventDefault();
      _0x5d05b7.stopPropagation();
    }
  }
  function _0x2f4bfb(_0x2936da) {
    if (!_0x40225d.draggingEnabled) {
      _0x2936da.preventDefault();
      _0x2936da.stopPropagation();
    }
  }
  function _0x59e35b(_0x8aca58) {
    _0x307f8d(_0x8aca58);
    _0x8aca58.keyCode = this.Settings.hk;
    this.p.keyInput2(_0x8aca58);
    this.p.holdPressed = false;
  }
  function _0x34824a() {
    $(".players").show();
    $("#main").hide();
    $(".tc").hide();
    $(".navbar-brand").html(
      '<img src="/res/svg/white/arrowLeft.svg"> Back to game',
    );
    $(".navbar-brand").addClass("navbar-back");
    $(".navbar").css("margin-bottom", "22px");
  }
  function _0x5e9bb7() {
    $(".players").hide();
    $(".tc").show();
    $("#main").show();
    $(".navbar-brand").html("Jstris");
    $(".navbar-brand").removeClass("navbar-back");
    $(".navbar").css("margin-bottom", "2px");
  }
  this.changeStyle();
  $("#touchBtn").on(
    "click",
    function () {
      if ($("#touchBtn").prop("checked")) {
        $("#tcc").show();
        $("#touchBtnMove").parent().parent().show();
      } else {
        $("#tcc").hide();
        $("#touchBtnMove").parent().parent().hide();
      }
    }.bind(this),
  );
  $("#res").on(
    "click",
    function () {
      if (
        !this.p.Bots &&
        (!!this.p.Live.sitout || this.p.Live.players.length === 0)
      ) {
        this.p.startPractice(this.p.selectedPmode);
      }
    }.bind(this),
  );
  $(".navbar-brand").on("click", _0x5e9bb7.bind(this));
  document.getElementById("lobby").addEventListener(
    "click",
    function () {
      _0x34824a();
    }.bind(this),
  );
  document.getElementById("res").addEventListener(
    "click",
    function () {
      _0x5e9bb7();
    }.bind(this),
  );
  document.getElementById("tc-hd").addEventListener(
    "touchstart",
    function (_0x5e4a12) {
      _0x307f8d(_0x5e4a12);
      _0x5e4a12.keyCode = this.Settings.hd;
      this.p.keyInput2(_0x5e4a12);
      this.p.hardDropPressed = false;
    }.bind(this),
  );
  document.getElementById("tc-l").addEventListener(
    "touchstart",
    function (_0x6cf138) {
      _0x4801fe(_0x6cf138);
      _0x6cf138.keyCode = this.Settings.ml;
      this.p.keyInput2(_0x6cf138);
    }.bind(this),
  );
  document.getElementById("tc-l").addEventListener(
    "touchend",
    function (_0x53abc2) {
      _0x2f4bfb(_0x53abc2);
      _0x53abc2.keyCode = this.Settings.ml;
      this.p.keyInput3(_0x53abc2);
    }.bind(this),
  );
  document.getElementById("tc-r").addEventListener(
    "touchstart",
    function (_0x215340) {
      _0x4801fe(_0x215340);
      _0x215340.keyCode = this.Settings.mr;
      this.p.keyInput2(_0x215340);
    }.bind(this),
  );
  document.getElementById("tc-r").addEventListener(
    "touchend",
    function (_0x1b3796) {
      _0x2f4bfb(_0x1b3796);
      _0x1b3796.keyCode = this.Settings.mr;
      this.p.keyInput3(_0x1b3796);
    }.bind(this),
  );
  document.getElementById("tc-d").addEventListener(
    "touchstart",
    function (_0x21df0d) {
      _0x4801fe(_0x21df0d);
      _0x21df0d.keyCode = this.Settings.sd;
      this.p.keyInput2(_0x21df0d);
    }.bind(this),
  );
  document.getElementById("tc-d").addEventListener(
    "touchend",
    function (_0x452cb0) {
      _0x2f4bfb(_0x452cb0);
      _0x452cb0.keyCode = this.Settings.sd;
      this.p.keyInput3(_0x452cb0);
    }.bind(this),
  );
  document.getElementById("tc-c").addEventListener(
    "touchstart",
    function (_0x2e3432) {
      _0x307f8d(_0x2e3432);
      _0x2e3432.keyCode = this.Settings.rr;
      this.p.keyInput2(_0x2e3432);
    }.bind(this),
  );
  document.getElementById("tc-cc").addEventListener(
    "touchstart",
    function (_0x5db0cf) {
      _0x307f8d(_0x5db0cf);
      _0x5db0cf.keyCode = this.Settings.rl;
      this.p.keyInput2(_0x5db0cf);
    }.bind(this),
  );
  document.getElementById("tc-dr").addEventListener(
    "touchstart",
    function (_0x1ea3ef) {
      _0x307f8d(_0x1ea3ef);
      _0x1ea3ef.keyCode = this.Settings.dr;
      this.p.keyInput2(_0x1ea3ef);
    }.bind(this),
  );
  document
    .getElementById("tc-h")
    .addEventListener("touchstart", _0x59e35b.bind(this));
  document
    .getElementById("holdCanvas")
    .addEventListener("touchstart", _0x59e35b.bind(this));
  this.showPlBtn = document.createElement("div");
  this.showPlBtn.id = "tc-vs";
  this.showPlBtn.addEventListener("click", _0x34824a.bind(this));
  this.showPlBtn.innerHTML = '<img src="/res/svg/dark/screens.svg">';
  let _0x30595f = document.createElement("div");
  _0x30595f.className = "mMenu";
  _0x30595f.appendChild(this.showPlBtn);
  document.getElementById("stage").appendChild(_0x30595f);
  this.setupButtonDragDrop();
};
Mobile.prototype.setupButtonDragDrop = function () {
  var _0x558d0d;
  var _0x9b8c41;
  var _0x19ad35 = [
    document.querySelector("#tc-hd"),
    document.querySelector("#tc-dr"),
    document.querySelector("#tc-l"),
    document.querySelector("#tc-r"),
    document.querySelector("#tc-d"),
    document.querySelector("#tc-cc"),
    document.querySelector("#tc-c"),
    document.querySelector("#tc-h"),
    this.showPlBtn,
  ];
  var _0x27e0ba = document.querySelector("#app");
  var _0x5d1834 = false;
  var _0x302062 = this;
  var _0x30d2d8 = false;
  var _0x177eee = 0;
  var _0x4bc85e = 1;
  var _0x2abaf7 = false;
  var _0x43a16f = 0;
  var _0x5cc422 = 0;
  var _0x56d2ee = 0;
  var _0x357e3f = [];
  function _0xfb6ec7(_0x5e41cc) {
    var _0x258e53 = _0x5e41cc[0].clientX - _0x5e41cc[1].clientX;
    var _0x2400d8 = _0x5e41cc[0].clientY - _0x5e41cc[1].clientY;
    return Math.sqrt(_0x258e53 * _0x258e53 + _0x2400d8 * _0x2400d8);
  }
  function _0x2edc25(_0x107baf) {
    if (!_0x302062.draggingEnabled) {
      return;
    }
    if (
      _0x107baf.type === "touchstart" &&
      _0x107baf.touches.length === 2
    ) {
      var _0x31f791 = (function (_0xfc32e1) {
        for (
          var _0x18dd26 = 0;
          _0x18dd26 < _0x19ad35.length;
          _0x18dd26++
        ) {
          var _0x34bfa4 = _0x19ad35[_0x18dd26];
          var _0x2cf164 = _0x34bfa4.getBoundingClientRect();
          var _0x44d233 =
            _0xfc32e1[0].clientX >= _0x2cf164.left &&
            _0xfc32e1[0].clientX <= _0x2cf164.right &&
            _0xfc32e1[0].clientY >= _0x2cf164.top &&
            _0xfc32e1[0].clientY <= _0x2cf164.bottom;
          var _0x24a6bc =
            _0xfc32e1[1].clientX >= _0x2cf164.left &&
            _0xfc32e1[1].clientX <= _0x2cf164.right &&
            _0xfc32e1[1].clientY >= _0x2cf164.top &&
            _0xfc32e1[1].clientY <= _0x2cf164.bottom;
          if (_0x44d233 && _0x24a6bc) {
            return _0x34bfa4;
          }
        }
        return null;
      })(_0x107baf.touches);
      if (_0x31f791) {
        _0x107baf.preventDefault();
        _0x30d2d8 = _0x31f791;
        _0x177eee = _0xfb6ec7(_0x107baf.touches);
        _0x4bc85e = _0x31f791.custom_scale || 1;
        _0x5d1834 = false;
        return;
      }
    }
    if (_0x19ad35.indexOf(_0x107baf.target) === -1) {
      return;
    }
    _0x5d1834 = _0x107baf.target;
    _0x43a16f = 0;
    let _0x536952 = _0x107baf.target.custom_xOffset
      ? _0x107baf.target.custom_xOffset
      : 0;
    let _0x39bf76 = _0x107baf.target.custom_yOffset
      ? _0x107baf.target.custom_yOffset
      : 0;
    if (_0x107baf.type === "touchstart") {
      _0x107baf.target.custom_initialX =
        _0x107baf.touches[0].clientX - _0x536952;
      _0x107baf.target.custom_initialY =
        _0x107baf.touches[0].clientY - _0x39bf76;
    } else {
      _0x107baf.target.custom_initialX =
        _0x107baf.clientX - _0x536952;
      _0x107baf.target.custom_initialY =
        _0x107baf.clientY - _0x39bf76;
    }
  }
  function _0x9bbf77(_0x266f82) {
    if (_0x30d2d8) {
      localStorage.setItem(
        _0x30d2d8.id + "_scale",
        _0x30d2d8.custom_scale.toFixed(3),
      );
      _0x30d2d8 = false;
      _0x177eee = 0;
      return;
    }
    if (!_0x302062.draggingEnabled || !_0x5d1834) {
      return;
    }
    _0x5d1834.custom_initialX = _0x558d0d;
    _0x5d1834.custom_initialY = _0x9b8c41;
    let _0x2c777f = _0x558d0d.toFixed(2) + "," + _0x9b8c41.toFixed(2);
    localStorage.setItem(_0x5d1834.id, _0x2c777f);
    _0x5d1834 = false;
    _0x43a16f = 0;
  }
  function _0x2e11b8(_0x67da41) {
    if (_0x302062.draggingEnabled) {
      if (
        _0x30d2d8 &&
        _0x67da41.type === "touchmove" &&
        _0x67da41.touches.length === 2
      ) {
        _0x67da41.preventDefault();
        var _0x14bb3e = _0xfb6ec7(_0x67da41.touches);
        var _0x538bff = _0x4bc85e * (_0x14bb3e / _0x177eee);
        _0x538bff = Math.max(0.5, Math.min(4, _0x538bff));
        if (_0x2abaf7) {
          _0x442fbe = _0x538bff;
          _0x143858 = (_0x1f0572 = _0x30d2d8).custom_baseWidth;
          _0x2d2c3a = _0x1f0572.custom_baseHeight;
          _0x25924d = _0x143858 * _0x442fbe;
          _0x59d87a = _0x2d2c3a * _0x442fbe;
          _0x157398 = (Math.round(_0x25924d / 5) * 5) / _0x143858;
          _0x273391 = (Math.round(_0x59d87a / 5) * 5) / _0x2d2c3a;
          _0x538bff =
            Math.abs(_0x143858 - _0x2d2c3a) < 1
              ? _0x157398
              : (_0x157398 + _0x273391) / 2;
          _0x538bff = Math.max(0.5, Math.min(4, _0x538bff));
        }
        _0x30d2d8.custom_scale = _0x538bff;
        _0x14881e(_0x30d2d8);
        return;
      }
      var _0x1f0572;
      var _0x442fbe;
      var _0x143858;
      var _0x2d2c3a;
      var _0x25924d;
      var _0x59d87a;
      var _0x157398;
      var _0x273391;
      if (_0x5d1834) {
        var _0x587bce;
        var _0x5e343d;
        _0x67da41.preventDefault();
        if (_0x67da41.type === "touchmove") {
          _0x587bce =
            _0x67da41.touches[0].clientX - _0x5d1834.custom_initialX;
          _0x5e343d =
            _0x67da41.touches[0].clientY - _0x5d1834.custom_initialY;
        } else {
          _0x587bce = _0x67da41.clientX - _0x5d1834.custom_initialX;
          _0x5e343d = _0x67da41.clientY - _0x5d1834.custom_initialY;
        }
        if (_0x2abaf7) {
          var _0xdb2dfd = Date.now();
          if (_0xdb2dfd < _0x43a16f) {
            if (
              !(
                Math.sqrt(
                  Math.pow(_0x587bce - _0x5cc422, 2) +
                    Math.pow(_0x5e343d - _0x56d2ee, 2),
                ) > 15
              )
            ) {
              return;
            }
            _0x43a16f = 0;
          }
          var _0x553c83 = (function (
            _0x5587df,
            _0x43be9f,
            _0x502029,
          ) {
            var _0x34dbf8 = _0x5587df.custom_originalX + _0x43be9f;
            var _0x3d2552 = _0x5587df.custom_originalY + _0x502029;
            var _0x28fc7d = Math.round(_0x34dbf8 / 5) * 5;
            var _0x18081b = Math.round(_0x3d2552 / 5) * 5;
            return {
              x: _0x28fc7d - _0x5587df.custom_originalX,
              y: _0x18081b - _0x5587df.custom_originalY,
            };
          })(_0x5d1834, _0x587bce, _0x5e343d);
          if (
            _0x553c83.x !== _0x558d0d ||
            _0x553c83.y !== _0x9b8c41
          ) {
            _0x43a16f = _0xdb2dfd + 150;
            _0x5cc422 = _0x587bce;
            _0x56d2ee = _0x5e343d;
          }
          _0x558d0d = _0x553c83.x;
          _0x9b8c41 = _0x553c83.y;
        } else {
          _0x558d0d = _0x587bce;
          _0x9b8c41 = _0x5e343d;
        }
        _0x5d1834.custom_xOffset = _0x558d0d;
        _0x5d1834.custom_yOffset = _0x9b8c41;
        _0x14881e(_0x5d1834);
      }
    }
  }
  function _0x14881e(_0xcc87c6) {
    var _0x39746d = _0xcc87c6.custom_xOffset || 0;
    var _0xb84e2e = _0xcc87c6.custom_yOffset || 0;
    var _0x14a0cf = _0xcc87c6.custom_scale || 1;
    _0xcc87c6.style.transform =
      "translate3d(" +
      Math.round(_0x39746d) +
      "px, " +
      Math.round(_0xb84e2e) +
      "px, 0) scale(" +
      _0x14a0cf +
      ")";
  }
  _0x19ad35.forEach((_0x236652, _0x15bfb7) => {
    _0x357e3f[_0x15bfb7] = _0x236652.style.transform;
    _0x236652.style.transform = "";
  });
  _0x19ad35.forEach((_0x153a35) => {
    var _0x2f65d0 = _0x153a35.getBoundingClientRect();
    _0x153a35.custom_originalX = Math.round(_0x2f65d0.left);
    _0x153a35.custom_originalY = Math.round(_0x2f65d0.top);
    _0x153a35.custom_baseWidth = Math.round(_0x2f65d0.width);
    _0x153a35.custom_baseHeight = Math.round(_0x2f65d0.height);
  });
  _0x19ad35.forEach((_0x53b758, _0x4973ce) => {
    _0x53b758.style.transform = _0x357e3f[_0x4973ce];
  });
  _0x19ad35.forEach((_0x519384) => {
    let _0x7a2e58 = localStorage.getItem(_0x519384.id);
    if (_0x7a2e58 !== null) {
      let _0x19c717 = _0x7a2e58.split(",", 2);
      _0x519384.custom_xOffset = parseFloat(_0x19c717[0]);
      _0x519384.custom_yOffset = parseFloat(_0x19c717[1]);
    }
    let _0x658c59 = localStorage.getItem(_0x519384.id + "_scale");
    _0x519384.custom_scale =
      _0x658c59 !== null ? parseFloat(_0x658c59) : 1;
    _0x14881e(_0x519384);
  });
  $("#touchBtnMove").on("click", function () {
    _0x302062.draggingEnabled = $("#touchBtnMove").prop("checked");
    if ($("#touchBtnMove").prop("checked")) {
      $("#touchBtnSnap").parent().parent().show();
      $("#touchBtnSnap").prop("checked", true);
      _0x2abaf7 = true;
    } else {
      $("#touchBtnSnap").parent().parent().hide();
      $("#touchBtnSnap").prop("checked", false);
      _0x2abaf7 = false;
    }
  });
  $("#touchBtnSnap").on("click", function () {
    _0x2abaf7 = $("#touchBtnSnap").prop("checked");
  });
  $("#touchBtnSnap").parent().parent().hide();
  _0x27e0ba.addEventListener("touchstart", _0x2edc25, false);
  _0x27e0ba.addEventListener("touchend", _0x9bbf77, false);
  _0x27e0ba.addEventListener("touchmove", _0x2e11b8, false);
  _0x27e0ba.addEventListener("mousedown", _0x2edc25, false);
  _0x27e0ba.addEventListener("mouseup", _0x9bbf77, false);
  _0x27e0ba.addEventListener("mousemove", _0x2e11b8, false);
};
Replay.prototype.add = function (_0x5e1900) {
  if (this.isAfkMode) {
    this.afkQueue.push(_0x5e1900);
  } else if (
    (_0x5e1900.a !== this.Action.DAS_LEFT ||
      !this.actions.length ||
      this.actions[this.actions.length - 1].a !== _0x5e1900.a) &&
    (_0x5e1900.a !== this.Action.DAS_RIGHT ||
      !this.actions.length ||
      this.actions[this.actions.length - 1].a !== _0x5e1900.a)
  ) {
    _0x5e1900.t -= this.config.gameStart;
    if (this.mode === 1) {
      _0x5e1900.t = 0;
    }
    this.actions.push(_0x5e1900);
    if (this.onMoveAdded) {
      this.onMoveAdded(_0x5e1900);
    }
  }
};
Replay.prototype.clear = function () {
  this.actions.length = 0;
  this.mode = 0;
  this.isAfkMode = false;
  this.afkQueue = [];
  this.string = "";
  this.md5 = "";
  this.config.mode = undefined;
  if ("afk" in this.config) {
    delete this.config.afk;
  }
  if ("bbs" in this.config) {
    delete this.config.bbs;
  }
  if ("rnd" in this.config) {
    delete this.config.rnd;
  }
};
Replay.prototype.toggleAfkMode = function (_0x3b5f86, _0x5b186e) {
  if (_0x3b5f86) {
    this.isAfkMode = true;
  } else {
    this.isAfkMode = false;
    for (let _0x3b92bf of this.afkQueue) {
      _0x3b92bf.t = _0x5b186e;
      this.add(_0x3b92bf);
    }
    this.afkQueue = [];
  }
};
Replay.prototype.getData = function () {
  if (this.mode === -1) {
    return "";
  }
  var _0x53a9bd = new Object();
  _0x53a9bd.d = this.getBlobData();
  _0x53a9bd.c = this.config;
  var _0x1e77cb = LZString.compressToEncodedURIComponent(
    JSON.stringify(_0x53a9bd),
  );
  this.string = _0x1e77cb;
  this.md5 = md5(_0x1e77cb);
  return this.md5;
};
Replay.prototype.pushEndPadding = function () {
  if (32 - this.stream.bitpos >= 12) {
    this.stream.pushBits(4095, 12);
  }
};
Replay.prototype.getBlobData = function () {
  this.stream = new ReplayStream();
  var _0x24ab94;
  var _0x2fa927 = null;
  var _0x16f61d = this.actions.length;
  var _0x407092 = 0;
  for (var _0x195e07 = 0; _0x195e07 < _0x16f61d; _0x195e07++) {
    if (_0x2fa927 !== null && _0x2fa927 > this.actions[_0x195e07].t) {
      let _0x322200 = _0x2fa927 - this.actions[_0x195e07].t;
      this.actions[_0x195e07].t = _0x2fa927;
      if (_0x322200 > 10) {
        this.config.err |= 1;
      }
    }
    _0x2fa927 = this.actions[_0x195e07].t;
    if (
      (_0x24ab94 = this.actions[_0x195e07].t - _0x407092 * 4094) >
      4094
    ) {
      _0x24ab94 -= 4094;
      _0x407092++;
    }
    if (_0x24ab94 < 0) {
      this.config.err |= 1;
      _0x24ab94 = 0;
    }
    if (_0x24ab94 > 4094) {
      this.config.err |= 2;
      _0x24ab94 = 4094;
    }
    this.stream.pushBits(_0x24ab94, 12);
    this.stream.pushBits(this.actions[_0x195e07].a, 4);
    if (this.AuxBits[this.actions[_0x195e07].a] !== undefined) {
      var _0x2aee6f = this.AuxBits[this.actions[_0x195e07].a];
      for (
        var _0x3c8fa4 = 0;
        _0x3c8fa4 < _0x2aee6f.length;
        _0x3c8fa4++
      ) {
        this.stream.pushBits(
          this.actions[_0x195e07].d[_0x3c8fa4],
          _0x2aee6f[_0x3c8fa4],
        );
      }
      if (this.actions[_0x195e07].a === this.Action.AUX) {
        if (this.actions[_0x195e07].d[0] === this.AUX.AFK) {
          this.stream.pushBits(this.actions[_0x195e07].d[1], 16);
          _0x407092 += (this.actions[_0x195e07].d[1] / 4094) >>> 0;
        } else if (
          this.actions[_0x195e07].d[0] === this.AUX.BLOCK_SET
        ) {
          this.stream.pushBits(this.actions[_0x195e07].d[1], 1);
          this.stream.pushBits(this.actions[_0x195e07].d[2], 4);
        } else if (
          this.actions[_0x195e07].d[0] === this.AUX.MOVE_TO
        ) {
          let _0x5add9b = this.actions[_0x195e07].d[1] + 3;
          let _0x370edf = this.actions[_0x195e07].d[2] + 12;
          if (
            _0x5add9b < 0 ||
            _0x5add9b > 15 ||
            _0x370edf < 0 ||
            _0x370edf > 31
          ) {
            this.config.err |= 16;
          }
          this.stream.pushBits(_0x5add9b, 4);
          this.stream.pushBits(_0x370edf, 5);
        } else if (
          this.actions[_0x195e07].d[0] === this.AUX.RANDOMIZER
        ) {
          this.stream.pushBits(this.actions[_0x195e07].d[1], 1);
          this.stream.pushBits(this.actions[_0x195e07].d[2], 5);
        } else if (
          this.actions[_0x195e07].d[0] === this.AUX.MATRIX_MOD
        ) {
          this.stream.pushBits(this.actions[_0x195e07].d[1], 4);
          this.stream.pushBits(this.actions[_0x195e07].d[2], 5);
        } else if (
          this.actions[_0x195e07].d[0] === this.AUX.WIDE_GARBAGE_ADD
        ) {
          this.stream.pushBits(this.actions[_0x195e07].d[1], 5);
          this.stream.pushBits(this.actions[_0x195e07].d[2], 4);
          this.stream.pushBits(this.actions[_0x195e07].d[3], 3);
          this.stream.pushBits(this.actions[_0x195e07].d[4], 1);
        }
      }
    }
  }
  this.pushEndPadding();
  return _arrayBufferToBase64(
    new Uint32Array(this.stream.data).buffer,
  );
};
Replay.prototype.getGameTime = function (_0x531f25 = true) {
  var _0x32f344 = this.actions[this.actions.length - 1].t;
  if (!_0x531f25) {
    if (this.config.afk !== undefined) {
      _0x32f344 -= this.config.afk;
    }
  }
  return Math.round(_0x32f344) / 1000;
};
Replay.prototype.postLiveData = function (
  _0x51345f,
  _0x1eac5b,
  _0x36d378,
  _0x5f29d1,
) {
  if (this.mode !== -1) {
    var _0x44fe30 = document.head.querySelector(
      "[name=csrf-token]",
    ).content;
    var _0x4ac4f2 = new XMLHttpRequest();
    var _0x1634b0 =
      "gid=" +
      _0x51345f +
      "&cid=" +
      _0x1eac5b +
      "&r=" +
      encodeURIComponent(this.string);
    if (_0x5f29d1) {
      _0x1634b0 += "&token=" + encodeURIComponent(_0x5f29d1);
    }
    _0x4ac4f2.timeout = 6000;
    _0x4ac4f2.open("POST", "/code/replayUploaderLive", true);
    _0x4ac4f2.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    _0x4ac4f2.setRequestHeader("X-CSRF-TOKEN", _0x44fe30);
    _0x4ac4f2.setRequestHeader(
      "Content-type",
      "application/x-www-form-urlencoded",
    );
    _0x4ac4f2.send(_0x1634b0);
  } else {
    this.clear();
  }
};
Replay.prototype.ver = function (_0xe773c5) {
  if (_0xe773c5.hasOwnProperty("vcsm")) {
    return _0xe773c5.vcsm;
  }
  {
    let _0x5272b0 =
      GameCore.toString() +
      "-" +
      Game.toString() +
      "-" +
      Live.toString();
    _0xe773c5.vcsm = md5(_0x5272b0);
  }
  return _0xe773c5.vcsm.substr(0, 16);
};
Replay.prototype.postData = function (_0x532b93, _0x3fb36e) {
  var _0x483219 = document.head.querySelector(
    "[name=csrf-token]",
  ).content;
  var _0x4b5b11 = new XMLHttpRequest();
  var _0x184304 = "/code/replayUploader";
  if (_0x3fb36e && !_0x3fb36e.authorized) {
    _0x184304 = "/code/replayUploaderGuest";
  }
  var _0x5dfecd =
    "id=" +
    _0x532b93 +
    "&r=" +
    encodeURIComponent(this.string) +
    "&c=" +
    this.ver(_0x3fb36e);
  _0x4b5b11.timeout = 10000;
  _0x4b5b11.open("POST", _0x184304, true);
  _0x4b5b11.setRequestHeader("X-Requested-With", "XMLHttpRequest");
  _0x4b5b11.setRequestHeader("X-CSRF-TOKEN", _0x483219);
  _0x4b5b11.setRequestHeader(
    "Content-type",
    "application/x-www-form-urlencoded",
  );
  var _0x424a77 = this;
  try {
    _0x4b5b11.send(_0x5dfecd);
  } catch (_0x57d406) {
    _0x424a77.uploadError(_0x3fb36e, _0x57d406.message);
  }
  _0x4b5b11.ontimeout = function () {
    _0x424a77.uploadError(_0x3fb36e, "REQUEST_TIMEOUT");
  };
  _0x4b5b11.onerror = _0x4b5b11.onabort = function () {
    _0x424a77.uploadError(_0x3fb36e, "REQUEST_FAIL");
  };
  _0x4b5b11.onload = function () {
    if (_0x4b5b11.status === 200) {
      if (typeof _0x424a77.onSaved == "function") {
        _0x424a77.onSaved(JSON.parse(_0x4b5b11.responseText));
      }
    } else {
      _0x424a77.uploadError(
        _0x3fb36e,
        _0x4b5b11.status + " - " + _0x4b5b11.statusText,
      );
    }
  };
};
Replay.prototype.uploadError = function (_0x55fc93, _0x1ae7f1) {
  if (this.string) {
    var _0x1a1a47 =
      "<span class='wFirstLine'><span class='wTitle'>!" +
      i18n.warning2 +
      "!</span> <b>" +
      i18n.repFail +
      "</b> (<em>" +
      _0x1ae7f1 +
      "</em>)</span>";
    _0x1a1a47 +=
      "<p>" + i18n.repInChat + " " + i18n.repTxtInfo + "</p>";
    _0x1a1a47 +=
      '<textarea readonly cols="30" onclick="this.focus();this.select()">' +
      this.string +
      "</textarea>";
    _0x55fc93.chatMajorWarning(_0x1a1a47);
  }
};
Replay.prototype.hasUserInputs = function () {
  if (!this.actions.length) {
    return false;
  }
  for (
    var _0x109ebe = 0;
    _0x109ebe < this.actions.length;
    _0x109ebe++
  ) {
    if (this.actions[_0x109ebe].a <= this.Action.ROTATE_180) {
      return true;
    }
  }
  return false;
};
ReplayStream.prototype.pushBits = function (_0xd905d5, _0x342700) {
  var _0x4099d0 = this.wordSize - this.bitpos;
  _0xd905d5 &= (1 << _0x342700) - 1;
  if (_0x4099d0 - _0x342700 >= 0) {
    this.data[this.datapos] |= _0xd905d5 << (_0x4099d0 - _0x342700);
    this.bitpos += _0x342700;
  } else {
    if (_0x4099d0 >= 0) {
      this.data[this.datapos] |= _0xd905d5 >> (_0x342700 - _0x4099d0);
    } else {
      _0x4099d0 = 0;
    }
    this.bitpos = _0x342700 - _0x4099d0;
    this.data[++this.datapos] =
      _0xd905d5 << (this.wordSize - this.bitpos);
  }
};
ReplayStream.prototype.pullBits = function (_0x5827bf) {
  if (this.data.length === this.byte) {
    return null;
  }
  var _0x26a67d;
  var _0x1ff271 = this.wordSize - (this.bitpos + _0x5827bf);
  if (_0x1ff271 >= 0) {
    var _0x34b1bf = ((1 << _0x5827bf) - 1) << _0x1ff271;
    _0x26a67d = (this.data[this.byte] & _0x34b1bf) >>> _0x1ff271;
    this.bitpos = this.bitpos + _0x5827bf;
    if (this.bitpos >= this.wordSize) {
      this.bitpos -= this.wordSize;
      this.byte++;
    }
  } else {
    var _0xe19e42 = _0x5827bf + _0x1ff271;
    var _0xba238d = (1 << _0xe19e42) - 1;
    var _0x4415d3 = (this.data[this.byte] & _0xba238d) << -_0x1ff271;
    ++this.byte;
    this.bitpos = 0;
    var _0x4283ed = this.pullBits(_0x5827bf - _0xe19e42);
    if (_0x4283ed === null) {
      return null;
    }
    _0x26a67d = _0x4415d3 | _0x4283ed;
  }
  return _0x26a67d;
};
RulesetManager.prototype.fullModeName = function (
  _0x3bae25,
  _0x5ba74e,
) {
  if (_0x3bae25 === 6) {
    return "Map " + _0x5ba74e;
  }
  var _0x439e57 = Math.floor(_0x5ba74e / 10);
  var _0xd3651e =
    _0x439e57 === 0 ? "" : this.RULESETS[_0x439e57].name;
  var _0xa2f7b2 = "";
  var _0x173b17 = "";
  _0x5ba74e %= 10;
  for (const _0x192768 of this.MODES) {
    if (_0x192768.id === _0x3bae25) {
      _0xa2f7b2 = _0x192768.n;
      for (const _0x54d819 of _0x192768.modes) {
        if (_0x54d819.id === _0x5ba74e) {
          _0x173b17 = _0x54d819.fn ? _0x54d819.fn : _0x54d819.n;
        }
      }
    }
  }
  return _0xd3651e + " " + _0xa2f7b2 + " " + _0x173b17;
};
RulesetManager.prototype.adjustToValidMode = function (
  _0x5ad518,
  _0x15dc44,
) {
  _0x15dc44 = parseInt(_0x15dc44);
  let _0xd53f36 = Number.MAX_SAFE_INTEGER;
  if (
    this.pmodeRuleId === 0 &&
    (_0x5ad518 === 6 || _0x5ad518 === 9)
  ) {
    return true;
  }
  for (const _0x2cac64 of this.MODES) {
    let _0x5a6228 = Number.MAX_SAFE_INTEGER;
    let _0x2d324a = 0;
    for (const _0x92b86f of _0x2cac64.modes) {
      let _0x153a4f = _0x92b86f.rs.indexOf(this.pmodeRuleId) !== -1;
      if (
        _0x2cac64.id === _0x5ad518 &&
        _0x92b86f.id === _0x15dc44 &&
        _0x153a4f
      ) {
        return;
      }
      if (_0x153a4f) {
        _0x2d324a++;
        if (_0x92b86f.id < _0x5a6228) {
          _0x5a6228 = _0x92b86f.id;
        }
      }
    }
    if (_0x2d324a && _0x2cac64.id < _0xd53f36) {
      _0xd53f36 = _0x2cac64.id;
    }
    if (_0x2cac64.id === _0x5ad518 && _0x2d324a) {
      this.p.sprintMode = _0x5a6228;
      return;
    }
  }
  this.p.pmode = _0xd53f36;
  this.setActiveMode(this.p.pmode);
  this.adjustToValidMode(this.p.pmode, -1);
};
RulesetManager.prototype.setActiveMode = function (_0x3ab350) {
  let _0x386948 = null;
  let _0x24d75b = null;
  let _0x4afd78 = this.p;
  for (const _0x860ebd of this.MODES) {
    if (_0x860ebd.id === _0x3ab350) {
      _0x386948 = _0x860ebd.elem;
      _0x24d75b = _0x860ebd.n;
      break;
    }
  }
  if (!_0x386948) {
    return;
  }
  let _0x359075 = this.modeMenu.getElementsByClassName("prKey");
  let _0x31f767 = null;
  for (var _0x46a811 = 0; _0x359075.length; _0x46a811++) {
    _0x31f767 = _0x359075[_0x46a811];
    _0x359075[_0x46a811].parentElement.removeChild(
      _0x359075[_0x46a811],
    );
  }
  if (!_0x31f767) {
    _0x31f767 = document.createElement("div");
    _0x31f767.textContent = "F4";
    _0x31f767.className = "prKey";
  }
  _0x386948.appendChild(_0x31f767);
  let _0x59027c = document.getElementById("practice-last");
  _0x59027c.textContent = _0x24d75b;
  _0x59027c.appendChild(_0x31f767);
  _0x59027c.onclick = _0x4afd78.startPractice.bind(
    _0x4afd78,
    _0x3ab350,
  );
  this.ruleSetChange(this.pmodeRuleId, false);
};
RulesetManager.prototype.updateModeMenu = function () {
  let _0x253c04 = this.pmodeRuleId;
  let _0x46a613 = this.p;
  while (this.modeMenu.firstChild) {
    this.modeMenu.removeChild(this.modeMenu.firstChild);
  }
  for (const _0x4a4e17 of this.MODES) {
    if (!_0x4a4e17.elem) {
      let _0x59119e = (_0x4a4e17.elem =
        document.createElement("div"));
      _0x59119e.className = "prMenuItem";
      _0x59119e.innerHTML = _0x4a4e17.n;
      _0x59119e.addEventListener("click", function () {
        _0x46a613.startPractice.call(_0x46a613, _0x4a4e17.id);
      });
    }
    let _0x5cbaab = _0x4a4e17.modes;
    let _0x41252f = [];
    for (const _0x496396 of _0x5cbaab) {
      if (_0x496396.rs.indexOf(_0x253c04) !== -1) {
        _0x41252f.push(_0x496396);
      }
    }
    if (
      _0x41252f.length &&
      (this.modeMenu.appendChild(_0x4a4e17.elem),
      _0x41252f.length > 1)
    ) {
      let _0x1f3cc2 = document.createElement("div");
      _0x1f3cc2.className = "practice-submenu";
      for (const _0x3efe5f of _0x41252f) {
        let _0x579a60 = document.createElement("div");
        _0x579a60.className = "pract-subopt";
        _0x579a60.innerHTML = _0x3efe5f.n;
        _0x579a60.onclick = function () {
          _0x46a613.sprintMode = _0x3efe5f.id;
          _0x46a613.startPractice.call(_0x46a613, _0x4a4e17.id);
        };
        _0x1f3cc2.appendChild(_0x579a60);
      }
      this.modeMenu.appendChild(_0x1f3cc2);
    }
  }
};
RulesetManager.prototype.ruleSetChange = function (
  _0x3f1a72,
  _0x2e1965 = true,
) {
  let _0x111117 = this.RULESETS[_0x3f1a72];
  if (_0x111117) {
    this.applyRule(_0x111117.c, this.p.conf[1]);
    this.rs1.children[1].textContent = _0x111117.name;
    this.pmodeRuleId = parseInt(_0x3f1a72);
    this.updateModeMenu();
    if (_0x2e1965) {
      this.adjustToValidMode(this.p.pmode, this.p.sprintMode);
    }
  }
};
RulesetManager.prototype.createOptions = function () {
  let _0x2b9a19 = this;
  this.combo = document.createElement("div");
  this.combo.classList.add("comboclass");
  let _0x2e79e8 = document.createElement("ul");
  for (const _0xd3dfe4 of this.RULESETS) {
    let _0x4323ec = document.createElement("li");
    _0x4323ec.classList.add("opt");
    let _0x1816e7 = document.createElement("span");
    _0x1816e7.textContent = _0xd3dfe4.name;
    _0x4323ec.appendChild(_0x1816e7);
    let _0x5920df = document.createElement("span");
    _0x5920df.classList.add("ruleDesc");
    _0x5920df.textContent = _0xd3dfe4.desc;
    _0x4323ec.appendChild(_0x5920df);
    let _0x277b5a = document.createElement("span");
    _0x277b5a.classList.add("ruleDiff");
    _0x277b5a.innerHTML = getSVG(
      "s-l" + _0xd3dfe4.lvl,
      "dark",
      "lIcn",
    );
    _0x4323ec.appendChild(_0x277b5a);
    _0x4323ec.dataset.id = _0xd3dfe4.id;
    _0x4323ec.addEventListener("click", function () {
      _0x2b9a19.ruleSetChange.call(_0x2b9a19, this.dataset.id);
    });
    _0x2e79e8.appendChild(_0x4323ec);
  }
  this.combo.appendChild(_0x2e79e8);
  this.combo.addEventListener("mouseup", function () {
    return false;
  });
};
RulesetManager.prototype.closeCombo = function (_0x1b7f1c) {
  return (
    this.combo !== null &&
    (hideElem(this.combo), (this.isOpen = false), true)
  );
};
RulesetManager.prototype.toggleCombo = function (
  _0x25fc0d,
  _0x201924,
) {
  if (this.isOpen) {
    this.closeCombo(_0x25fc0d);
  } else {
    if (!this.combo) {
      this.createOptions();
      _0x201924.appendChild(this.combo);
    }
    showElem(this.combo);
    this.isOpen = true;
  }
  _0x25fc0d.stopImmediatePropagation();
};
RulesetManager.prototype.registerCombo = function () {
  var _0x13132a = this;
  this.rs1.addEventListener("mouseup", function (_0x19c541) {
    _0x13132a.toggleCombo.call(_0x13132a, _0x19c541, _0x13132a.rs1);
  });
  document.addEventListener("mouseup", function (_0x21b244) {
    _0x13132a.closeCombo.call(_0x13132a, _0x21b244);
  });
};
RulesetManager.prototype.afterRuleChange = function (_0x4dd3cd) {};
RulesetManager.prototype.forceApplyChanges = function (_0x1c44ea) {
  this.p.randomizer = this.p.randomizerFactory(_0x1c44ea.rnd);
  this.p.setSpeedLimit(_0x1c44ea.speedLimit);
  this.p.applyGravityLvl(_0x1c44ea.gravityLvl);
  this.p.setLockDelay(_0x1c44ea.lockDelay);
};
RulesetManager.prototype.applyRule = function (
  _0x5688b7,
  _0x3375e2,
  _0x1fefed = true,
) {
  for (const _0x4d8485 in this.RULE_KEYS) {
    let _0x3704d5 = this.RULE_KEYS[_0x4d8485];
    if (_0x5688b7.hasOwnProperty(_0x4d8485)) {
      _0x3375e2[_0x3704d5] = _0x5688b7[_0x4d8485];
    } else if (_0x1fefed) {
      _0x3375e2[_0x3704d5] = _0x5688b7[_0x4d8485] =
        this.DEF[_0x3704d5];
    }
  }
  this.afterRuleChange(_0x3375e2);
};
RulesetManager.prototype.applyPresetRule = function (
  _0x5c2b16,
  _0x23a5bf,
  _0x5f130f = true,
) {
  let _0xc4ba8a = {};
  for (const _0x4943c8 in this.PRESET_KEYS) {
    let _0x381ebb = this.PRESET_KEYS[_0x4943c8];
    let _0x3c474a = null;
    if (_0x5c2b16.hasOwnProperty(_0x4943c8)) {
      _0x3c474a = _0x5c2b16[_0x4943c8];
    } else if (_0x5f130f) {
      _0x3c474a = _0x5c2b16[_0x4943c8] = this.DEF[_0x381ebb];
    }
    if (
      _0x3c474a !== null &&
      (!_0x23a5bf.hasOwnProperty(_0x381ebb) ||
        _0x23a5bf[_0x381ebb] != _0x3c474a)
    ) {
      _0x23a5bf[_0x381ebb] = _0x3c474a;
      _0xc4ba8a[_0x381ebb] = _0x3c474a;
    }
  }
  this.afterRuleChange(_0x23a5bf);
  return _0xc4ba8a;
};
RulesetManager.prototype.appendRule = function (
  _0x15804f,
  _0x299a4e,
) {
  for (const _0x5bb510 in this.RULE_KEYS) {
    let _0x2bfb63 = this.RULE_KEYS[_0x5bb510];
    if (_0x15804f.hasOwnProperty(_0x5bb510)) {
      _0x299a4e[_0x2bfb63] = _0x15804f[_0x5bb510];
    }
  }
  this.afterRuleChange(_0x299a4e);
};
Items.prototype.avail = function () {
  return false;
};
Items.prototype.loadConf = function (_0x27dd6b) {
  this.P1 = _0x27dd6b.P1;
  var _0x1534c8 = this;
  _0x27dd6b.def.forEach(function (_0x2da467) {
    if (_0x2da467.m) {
      _0x1534c8.itmDef[_0x2da467.id].m = _0x2da467.m;
    }
    if (_0x2da467.p) {
      _0x1534c8.itmDef[_0x2da467.id].p = _0x2da467.p;
    }
  });
};
Items.prototype.autoSelectKey = function () {
  let _0x2597ee = 0;
  let _0x561462 = [
    [87, "w"],
    [86, "v"],
    [88, "x"],
    [90, "z"],
    [67, "c"],
    [65, "a"],
    [66, "b"],
    [68, "d"],
    [69, "e"],
    [70, "f"],
    [71, "g"],
  ];
  let _0x3684c8 = this.p.Settings.controls;
  for (let _0xb5f575 = 0; _0xb5f575 < _0x561462.length; _0xb5f575++) {
    let _0x1c214c = _0x561462[_0xb5f575];
    if (!_0x3684c8.includes(_0x1c214c[0])) {
      _0x2597ee = _0xb5f575;
      break;
    }
  }
  let _0x43a43d = _0x561462[_0x2597ee][0];
  let _0x53eceb =
    "<b>" + _0x561462[_0x2597ee][1].toUpperCase() + "</b> to use";
  this.key = _0x43a43d;
  this.itmTxt.innerHTML = _0x53eceb;
};
Items.prototype.genItem = function () {
  var _0x403da6 = this.p.random(0, this.P1 - 1);
  if (this.avail()) {
    if (_0x403da6 === 0 || this.fs) {
      this.fs = false;
      return this.p.random(1, 4);
    } else {
      return 0;
    }
  }
};
Items.prototype.genItemType = function () {
  if (this.f) {
    let _0x48df56 = this.itmDef[this.f];
    this.f = null;
    return _0x48df56;
  }
  return this.resolveProb("p");
};
Items.prototype.onReset = function () {
  if (this.avail()) {
    this.preloadIcons();
  }
  this.origBBS = 0;
  var _0x1f31f6 = this;
  if (this.active) {
    this.active.forEach(function (_0x41ad16) {
      _0x1f31f6.revert(_0x41ad16.id);
    });
  }
  this.active = [];
  this.autoSelectKey();
  this.reset();
};
Items.prototype.reset = function () {
  this.item = null;
  hideElem(this.itmBox);
};
Items.prototype.pickup = function () {
  showElem(this.itmBox);
  let _0x1b3f7b = this.genItemType();
  this.item = _0x1b3f7b.id;
  this.p.playSound("pickup");
  if (this.item === 9) {
    this.preloadIcons();
    this.itmIcn.style.backgroundImage = null;
    this.itmIcn.classList.add("mysteryItem");
    this.itmIcn.classList.add("fullSize");
  } else {
    this.itmIcn.style.backgroundImage = "url(" + _0x1b3f7b.i + ")";
    this.itmIcn.classList.remove("mysteryItem");
    this.itmIcn.classList.remove("fullSize");
  }
};
Items.prototype.onHardDrop = function () {
  let _0x274c9b = this.active.length;
  while (_0x274c9b--) {
    let _0x233400 = this.active[_0x274c9b];
    _0x233400.hd--;
    if (_0x233400.hd <= 0) {
      this.active.splice(_0x274c9b, 1);
      this.revert(_0x233400.id);
    }
  }
};
Items.prototype.use = function (_0x3971ee) {
  _0x3971ee = _0x3971ee || this.p.timestamp();
  let _0x5dfb9a = this.item;
  if (this.item) {
    this.item = null;
    if (_0x5dfb9a !== 9) {
      this.reset();
    }
    this.p.playSound("item");
    this.applyItem(_0x5dfb9a, _0x3971ee);
  }
};
Items.prototype.applyItem = function (_0x2f2531, _0x3bb0ec) {
  if (_0x2f2531 === 1) {
    this.changeRandomizer(11, true, _0x3bb0ec);
    let _0x4104ce = new ItemActivation(_0x2f2531);
    _0x4104ce.hd = 7;
    this.active.push(_0x4104ce);
  } else if (_0x2f2531 === 2) {
    this.changeMatrix(1);
  } else if (_0x2f2531 === 3) {
    this.changeMatrix(2);
  } else if (_0x2f2531 === 4) {
    this.changeMatrix(3);
    let _0xd7d923 = new ItemActivation(_0x2f2531);
    _0xd7d923.hd = this.p.random(5, 11);
    this.active.push(_0xd7d923);
  } else if (_0x2f2531 === 5) {
    this.p.play = false;
    this.p.animator = new PoisonAnimator(this, this.p);
  } else if (_0x2f2531 === 6) {
    this.changeBBS(4, _0x3bb0ec);
    let _0x2db625 = new ItemActivation(_0x2f2531);
    _0x2db625.hd = 5;
    this.active.push(_0x2db625);
  } else if (_0x2f2531 === 7) {
    var _0x56429e = new ReplayAction(
      this.p.Replay.Action.AUX,
      _0x3bb0ec,
    );
    _0x56429e.d = [this.p.Replay.AUX.BLOCK_SET, 0, 2];
    this.p.Replay.add(_0x56429e);
    this.p.temporaryBlockSet = 2;
  } else if (_0x2f2531 === 8) {
    this.changeMatrix(4);
  } else if (_0x2f2531 === 9) {
    this.mysteryItem(_0x3bb0ec);
  } else if (_0x2f2531 === 10) {
    this.p.Caption.loading("Instant win", 2);
  } else if (_0x2f2531 === 11) {
    this.changeRandomizer(12, true, _0x3bb0ec);
    let _0x4ed005 = new ItemActivation(_0x2f2531);
    _0x4ed005.hd = this.p.random(7, 28);
    this.active.push(_0x4ed005);
  } else if (_0x2f2531 === 12) {
    this.changeBBS(2, _0x3bb0ec);
    let _0x43495e = new ItemActivation(_0x2f2531);
    _0x43495e.hd = this.p.random(5, 27);
    this.active.push(_0x43495e);
  }
};
Items.prototype.preloadIcons = function () {
  if (!this.preload.length) {
    for (var _0xd25261 of this.itmDef) {
      if (_0xd25261) {
        var _0x5886ae = new Image();
        _0x5886ae.src = _0xd25261.i;
        this.preload.push(_0x5886ae);
      }
    }
  }
};
Items.prototype.resolveProb = function (_0x5118b7) {
  var _0x21d51e = Math.random();
  var _0x3e3094 = 0;
  for (
    var _0x445ae7 = 0;
    _0x445ae7 < this.itmDef.length;
    _0x445ae7++
  ) {
    let _0x2b14d0 = this.itmDef[_0x445ae7];
    if (
      _0x2b14d0 &&
      _0x21d51e < (_0x3e3094 += _0x2b14d0[_0x5118b7])
    ) {
      return _0x2b14d0;
    }
  }
  return results[this.itmDef.length - 1];
};
Items.prototype.resolveMystery = function () {
  return this.resolveProb("m");
};
Items.prototype.mysteryItem = function (_0x316da6) {
  let _0xb0f0df = this.resolveMystery().id;
  let _0x157a24 = this.itmDef[_0xb0f0df];
  this.itmIcn.style.backgroundImage = "url(" + _0x157a24.i + ")";
  this.applyItem(_0xb0f0df, _0x316da6);
  this.itmIcn.classList.remove("fullSize");
  var _0x414125 = this;
  setTimeout(function () {
    if (_0x414125.item === null) {
      hideElem(_0x414125.itmBox);
    }
  }, 1500);
};
Items.prototype.changeBBS = function (_0x8345ca, _0x151bf4) {
  _0x151bf4 = _0x151bf4 || this.p.timestamp();
  var _0x249c3d = new ReplayAction(
    this.p.Replay.Action.AUX,
    _0x151bf4,
  );
  _0x249c3d.d = [this.p.Replay.AUX.BLOCK_SET, 1, _0x8345ca];
  this.p.Replay.add(_0x249c3d);
  this.p.R.baseBlockSet = _0x8345ca;
  this.changeRandomizer(this.p.R.rnd, true, _0x151bf4);
};
Items.prototype.changeMatrix = function (_0x55cbb6) {
  if (_0x55cbb6 === 1) {
    let _0x37ea79 = this.p.random(10, 31);
    this.p.play = false;
    this.p.animator = new WindAnimator(this, this.p, _0x37ea79);
    (_0x100604 = new ReplayAction(
      this.p.Replay.Action.AUX,
      this.p.timestamp(),
    )).d = [this.p.Replay.AUX.MATRIX_MOD, 0, _0x37ea79];
    this.p.Replay.add(_0x100604);
  } else if (_0x55cbb6 === 2) {
    this.p.play = false;
    this.p.animator = new CompressAnimator(this, this.p);
    (_0x100604 = new ReplayAction(
      this.p.Replay.Action.AUX,
      this.p.timestamp(),
    )).d = [this.p.Replay.AUX.MATRIX_MOD, 1, 0];
    this.p.Replay.add(_0x100604);
  } else if (_0x55cbb6 === 3) {
    (_0x100604 = new ReplayAction(
      this.p.Replay.Action.AUX,
      this.p.timestamp(),
    )).d = [this.p.Replay.AUX.MATRIX_MOD, 2, 0];
    this.p.Replay.add(_0x100604);
    this.loadFourWide();
    this.p.redraw();
  } else if (_0x55cbb6 === 4) {
    var _0x100604;
    (_0x100604 = new ReplayAction(
      this.p.Replay.Action.AUX,
      this.p.timestamp(),
    )).d = [this.p.Replay.AUX.MATRIX_MOD, 3, 0];
    this.p.Replay.add(_0x100604);
    this.p.play = false;
    this.p.animator = new InvertAnimator(this, this.p);
    this.p.setCurrentPieceToDefaultPos();
    this.p.updateGhostPiece(true);
  }
};
Items.prototype.wipeDeadline = function () {
  for (var _0xdd7d62 = 0; _0xdd7d62 < 10; ++_0xdd7d62) {
    this.p.deadline[_0xdd7d62] = 0;
  }
};
Items.prototype.invertMatrix = function () {
  this.wipeDeadline();
  for (var _0x6c1e38 = 0; _0x6c1e38 < 2; _0x6c1e38++) {
    if (this.p.matrix[_0x6c1e38][0] !== 9) {
      var _0x2666ee = this.p.matrix[_0x6c1e38];
      for (var _0x13f193 = 0; _0x13f193 < 10; ++_0x13f193) {
        _0x2666ee[_0x13f193] = 0;
      }
    }
  }
  for (_0x6c1e38 = 2; _0x6c1e38 < this.p.matrix.length; _0x6c1e38++) {
    if (this.p.matrix[_0x6c1e38][0] !== 9) {
      _0x2666ee = this.p.matrix[_0x6c1e38];
      var _0x39f5a6 = 0;
      for (_0x13f193 = 0; _0x13f193 < 10; ++_0x13f193) {
        if (_0x2666ee[_0x13f193]) {
          _0x2666ee[_0x13f193] = 0;
        } else if (_0x2666ee[_0x13f193] === 0) {
          _0x2666ee[_0x13f193] = 8;
          _0x39f5a6++;
        }
      }
      if (_0x39f5a6 === 10) {
        _0x2666ee[9] = 0;
      }
    }
  }
};
Items.prototype.loadFourWide = function (_0x2faabf) {
  if (!_0x2faabf) {
    _0x2faabf = this.p.MapManager;
  }
  var _0x11c9ff = 0;
  _0x2faabf.parseMatrix(
    "VmAAAiJUYAACIlRAAAMyUUAAAzIRcAAGZhdwAAEWEXAABxFREAAHdVIgAAcVUiAAARVSIAABdWIgAAd3ZmAABmYzUAAGZjNQAAYzIlAABjNSUAACIlIQAAJEURRABEJRRAACIg==",
  );
  this.wipeDeadline();
  let _0x54b8fe = 0;
  for (
    var _0x371589 = (_0x11c9ff = this.p.matrix.length - 1);
    _0x371589 >= 0;
    --_0x371589, --_0x11c9ff
  ) {
    if (this.p.matrix[_0x371589][0] !== 9) {
      this.p.matrix[_0x371589] =
        _0x2faabf.matrix[_0x11c9ff + _0x54b8fe];
    } else {
      _0x54b8fe++;
    }
  }
  this.p.setCurrentPieceToDefaultPos();
  this.p.updateGhostPiece(true);
  this.p.comboCounter = -1;
};
Items.prototype.compressMatrix = function (_0x1a1a13) {
  function _0xa65252(_0x3b0f4d, _0x94a60b) {
    if (!_0x94a60b[_0x3b0f4d - 1]) {
      for (var _0x5c09cb = _0x3b0f4d; _0x5c09cb < 10; ++_0x5c09cb) {
        _0x94a60b[_0x5c09cb - 1] = _0x94a60b[_0x5c09cb];
      }
      _0x94a60b[9] = 0;
    }
  }
  this.wipeDeadline();
  for (var _0x1b5a3f = 1; _0x1b5a3f <= _0x1a1a13; _0x1b5a3f++) {
    for (var _0x12e86b = 0; _0x12e86b < 20; ++_0x12e86b) {
      if (this.p.matrix[_0x12e86b][0] !== 9) {
        _0xa65252(_0x1b5a3f, this.p.matrix[_0x12e86b]);
      }
    }
  }
};
Items.prototype.tfTornado = function (_0x3a647d) {
  var _0xf54ad6 = copyMatrix(this.p.matrix);
  this.wipeDeadline();
  for (var _0xf37c1 = 0; _0xf37c1 < 20; ++_0xf37c1) {
    if (_0xf54ad6[_0xf37c1][0] === 9) {
      continue;
    }
    let _0x80d346 = (_0xf37c1 % 2 == 0 ? 1 : -1) * _0x3a647d;
    for (var _0x131e72 = 0; _0x131e72 < 10; ++_0x131e72) {
      let _0xa61e93 = (_0x131e72 + _0x80d346) % 10;
      while (_0xa61e93 < 0) {
        _0xa61e93 += 10;
      }
      this.p.matrix[_0xf37c1][_0x131e72] =
        _0xf54ad6[_0xf37c1][_0xa61e93];
    }
  }
};
Items.prototype.changeRandomizer = function (
  _0x19c3e6,
  _0x353a62,
  _0x1753b5,
) {
  let _0x173932 = _0x1753b5 || this.p.timestamp();
  let _0x431cee = _0x353a62 ? 1 : 0;
  this.p.randomizer = this.p.randomizerFactory(_0x19c3e6);
  if (_0x353a62) {
    this.p.generateQueue();
    this.p.updateQueueBox();
  }
  var _0x581a7a = new ReplayAction(
    this.p.Replay.Action.AUX,
    _0x173932,
  );
  _0x581a7a.d = [this.p.Replay.AUX.RANDOMIZER, _0x431cee, _0x19c3e6];
  this.p.Replay.add(_0x581a7a);
};
Items.prototype.revert = function (_0x20afaf) {
  if (_0x20afaf === 1) {
    this.changeRandomizer(this.p.R.rnd, false);
  } else if (_0x20afaf === 4) {
    let _0xd0eee3 = this.item;
    this.item = 2;
    this.use();
    this.item = _0xd0eee3;
    this.p.hdAbort = true;
  } else if (_0x20afaf === 6) {
    this.changeBBS(this.origBBS);
  } else if (_0x20afaf === 11) {
    this.changeRandomizer(this.p.R.rnd, false);
  } else if (_0x20afaf === 12) {
    this.changeBBS(this.origBBS);
  }
};
InvertAnimator.prototype.render = function (_0x1360c7) {
  for (this.d += _0x1360c7; this.d > this.PER_ROUND; ) {
    this.d -= this.PER_ROUND;
    this.iter();
  }
};
InvertAnimator.prototype.iter = function () {
  this.i++;
  var _0x51d4d2 = this.tmpMatrix;
  this.tmpMatrix = this.g.matrix;
  this.g.matrix = _0x51d4d2;
  if (this.i !== 2) {
    this.g.redraw();
  } else {
    this.finished();
  }
};
InvertAnimator.prototype.finished = function () {
  this.g.animator = null;
  if (!this.g.gameEnded) {
    this.g.play = true;
  }
  this.g.redrawBlocked = false;
  this.g.ghostEnabled = this.hadGhost;
  this.g.updateGhostPiece(true);
  this.g.redraw();
};
PoisonAnimator.prototype.render = function (_0x260cf8) {
  for (this.d += _0x260cf8; this.d > this.PER_ROUND; ) {
    this.d -= this.PER_ROUND;
    this.iter();
  }
};
PoisonAnimator.prototype.iter = function () {
  this.i++;
  this.g.play = true;
  this.g.hardDrop();
  if (!this.g.play) {
    this.finished();
  }
  this.g.play = false;
};
PoisonAnimator.prototype.finished = function () {
  this.g.animator = null;
  if (!this.g.gameEnded) {
    this.g.play = true;
  }
  this.g.redrawBlocked = false;
  this.g.ghostEnabled = this.hadGhost;
  this.g.updateGhostPiece(true);
  this.g.redraw();
};
CompressAnimator.prototype.render = function (_0x34296b) {
  for (this.d += _0x34296b; this.d > this.PER_ROUND; ) {
    this.d -= this.PER_ROUND;
    this.iter();
  }
};
CompressAnimator.prototype.iter = function () {
  this.i++;
  this.items.compressMatrix(this.i);
  this.g.redraw();
  if (this.i >= 10) {
    this.finished();
  }
};
CompressAnimator.prototype.finished = function () {
  this.g.animator = null;
  if (!this.g.gameEnded) {
    this.g.play = true;
  }
  this.g.redrawBlocked = false;
  this.g.ghostEnabled = this.hadGhost;
  this.g.updateGhostPiece(true);
  this.g.redraw();
};
WindAnimator.prototype.render = function (_0x6f7a29) {
  for (this.d += _0x6f7a29; this.d > this.PER_ROUND; ) {
    this.d -= this.PER_ROUND;
    this.iter();
  }
};
WindAnimator.prototype.iter = function () {
  this.items.tfTornado(1);
  this.g.redraw();
  this.i--;
  if (this.i <= 0) {
    this.finished();
  }
};
WindAnimator.prototype.finished = function () {
  this.g.animator = null;
  if (!this.g.gameEnded) {
    this.g.play = true;
  }
  this.g.redrawBlocked = false;
  this.g.ghostEnabled = this.hadGhost;
  this.g.updateGhostPiece(true);
  this.g.redraw();
};
Friends.prototype.connect = function (_0x4439b7, _0x2cb299) {
  this.uri = _0x4439b7;
  this.jwt = _0x2cb299;
  this.socket = new WebSocket(_0x4439b7);
  this.socket.onopen = this.onOpen.bind(this);
  this.socket.onmessage = this.onMessage.bind(this);
  this.socket.onclose = this.onClose.bind(this);
  var _0x2d00ee = this;
  this.connectionTimeout = setTimeout(function () {
    var _0x342b57 = _0x2d00ee.socket;
    if (_0x342b57 !== null && _0x342b57.readyState === 0) {
      _0x342b57.onclose = _0x342b57.onmessage = function () {};
      _0x342b57.onopen = function () {
        _0x342b57.close();
      };
      _0x342b57.close();
      _0x2d00ee.socket = _0x342b57 = null;
      console.log("FS timeout");
      _0x2d00ee.reconnect();
    }
  }, 5000);
};
Friends.prototype.connected = function () {
  return this.socket && this.socket.readyState === this.socket.OPEN;
};
Friends.prototype.isFriendChat = function () {
  return !!this.friendsOpened && !!this.openChatName;
};
Friends.prototype.safeSend = function (_0x98e882) {
  return (
    !!this.socket &&
    this.socket.readyState === this.socket.OPEN &&
    (this.socket.send(_0x98e882), true)
  );
};
Friends.prototype.sendChat = function (_0x425a2d) {
  let _0xc35e55 = JSON.stringify({
    t: 5,
    u: this.openChatName,
    m: _0x425a2d,
  });
  this.safeSend(_0xc35e55);
  if (!this.connected()) {
    let _0x3f65a0 = document.createElement("div");
    _0x3f65a0.innerHTML =
      "<b>" +
      this.Live.getName(this.Live.cid) +
      "</b>: " +
      htmlEntities(_0x425a2d);
    _0x3f65a0.style.color = "#ff5555";
    this.showInChat("", _0x3f65a0);
    let _0x12bed1 = document.createElement("img");
    _0x12bed1.src = CDN_URL("/res/svg/spinWhite.svg");
    _0x12bed1.style.width = "0.8em";
    _0x3f65a0 = document.createElement("div");
    _0x3f65a0.appendChild(_0x12bed1);
    _0x3f65a0.style.fontWeight = "bold";
    _0x3f65a0.innerHTML += " Could not send, reconnecting...";
    _0x3f65a0.style.fontSize = "0.7em";
    _0x3f65a0.style.color = "grey";
    this.showInChat("", _0x3f65a0);
  }
};
Friends.prototype.sendInvite = function () {
  if (!this.friendsOpened || !this.openChatName || !this.statusData) {
    return;
  }
  let _0x14fb3b =
    "[INV:" +
    this.statusData.r +
    ":" +
    this.statusData.n.replace(/:/g, "\\:") +
    "]";
  this.sendChat(_0x14fb3b);
};
Friends.prototype.reconnect = function () {
  this.reconnects++;
  let _0x1e055e = Math.min(5000, (this.reconnects - 1) * 1000);
  if (this.reconnects > 60) {
    _0x1e055e = 30000;
  }
  _0x1e055e = Math.max(this.forcedReconDelay, _0x1e055e);
  if (this.reconnects <= 100) {
    var _0x367ad9 = this;
    setTimeout(function () {
      _0x367ad9.connect(_0x367ad9.uri, _0x367ad9.jwt);
    }, _0x1e055e);
  }
};
Friends.prototype.onOpen = function () {
  if (this.connectionTimeout) {
    clearTimeout(this.connectionTimeout);
    this.connectionTimeout = null;
  }
  let _0x6693a3 = JSON.stringify({
    t: 1,
    j: this.jwt,
  });
  this.safeSend(_0x6693a3);
};
Friends.prototype.onMessage = function (_0x40f36b) {
  if (typeof _0x40f36b.data == "string") {
    this.handleResponse(JSON.parse(_0x40f36b.data));
  }
};
Friends.prototype.handleResponse = function (_0xeb1fbf) {
  switch (_0xeb1fbf.t) {
    case 1:
      this.reconnects = 0;
      this.forcedReconDelay = 0;
      this.friendsError = null;
      let _0x393731 = JSON.stringify({
        t: 2,
      });
      this.safeSend(_0x393731);
      if (this.pendingStatus) {
        this.safeSend(this.pendingStatus);
        this.pendingStatus = null;
      }
      break;
    case 2:
      this.friends = _0xeb1fbf.f;
      this.friendsCount = Array.isArray(this.friends)
        ? this.friends.length
        : 0;
      if (this.friendsOpened) {
        this.friendBoxMode(this.VIEW_MODE.FRIEND_LIST);
      }
      if (_0xeb1fbf.u && _0xeb1fbf.u.length) {
        this.unreadChannels = {};
        for (let _0x2b1d08 of _0xeb1fbf.u) {
          this.unreadChannels[_0x2b1d08] = 1;
        }
        if (!this.friendsOpened) {
          this.friendsNotif(_0xeb1fbf.u.length);
        }
      }
      break;
    case 4:
      if (this.friendsOpened && _0xeb1fbf.u === this.openChatName) {
        for (
          let _0x177895 = _0xeb1fbf.h.length - 1;
          _0x177895 >= 0;
          --_0x177895
        ) {
          let _0x1e9721 =
            _0xeb1fbf.h[_0x177895].s === 1
              ? this.Live.getName(this.Live.cid)
              : this.Live.getAuthorizedNameLink(_0xeb1fbf.u, 0);
          this.showInChat(
            _0x1e9721,
            _0xeb1fbf.h[_0x177895].m,
            null,
            _0xeb1fbf.h[_0x177895].t,
          );
        }
        delete this.unreadChannels[_0xeb1fbf.u];
        if (!_0xeb1fbf.h.length) {
          let _0x2a90e0 = document.createElement("div");
          _0x2a90e0.innerHTML = trans(i18n.frNewChatH, {
            name: this.Live.getAuthorizedNameLink(_0xeb1fbf.u, 0),
          });
          _0x2a90e0.style.color = "grey";
          _0x2a90e0.style.fontSize = "0.8em";
          _0x2a90e0.style.textAlign = "center";
          this.showInChat("", _0x2a90e0);
        }
      }
      break;
    case 5:
      let _0x5871f5 = _0xeb1fbf.u;
      if (!_0xeb1fbf.s) {
        this.checkNewFriend(_0xeb1fbf.u);
      }
      if (this.friendsOpened) {
        if (_0x5871f5 === this.openChatName) {
          let _0x5ae9f8 =
            _0xeb1fbf.s === 1
              ? this.Live.getName(this.Live.cid)
              : this.Live.getAuthorizedNameLink(
                  _0x5871f5,
                  _0xeb1fbf.y,
                );
          this.showInChat(_0x5ae9f8, _0xeb1fbf.m, null, _0xeb1fbf.i);
          if (!_0xeb1fbf.s) {
            let _0x322290 = JSON.stringify({
              t: 6,
              u: _0x5871f5,
              i: _0xeb1fbf.i,
            });
            this.safeSend(_0x322290);
          }
        } else if (this.openChatName !== null) {
          this.notifSoundDM();
          if (this.dmChatBackButton) {
            let _0x4f707a =
              this.dmChatBackButton.getElementsByClassName(
                "msgNotif",
              );
            if (_0x4f707a.length) {
              _0x4f707a = _0x4f707a[0];
              let _0x1f2675 = parseInt(_0x4f707a.textContent);
              if (_0x1f2675) {
                _0x1f2675 += 1;
              } else {
                _0x1f2675 = 1;
              }
              _0x4f707a.textContent = Math.min(99, _0x1f2675);
            } else {
              _0x4f707a = document.createElement("div");
              _0x4f707a.className = "msgNotif";
              _0x4f707a.textContent = 1;
              this.dmChatBackButton.appendChild(_0x4f707a);
            }
          }
        } else {
          this.notifSoundDM();
          let _0x1a466d = document.getElementById("fr-" + _0x5871f5);
          if (_0x1a466d) {
            let _0x2c2fb6 =
              _0x1a466d.getElementsByClassName("f-ch")[0];
            let _0x456645 =
              _0x2c2fb6.getElementsByClassName("msgNotif");
            if (_0x456645.length) {
              let _0x227b92 = parseInt(_0x456645[0].textContent);
              if (_0x227b92) {
                _0x227b92 += 1;
              } else {
                _0x227b92 = 1;
              }
              _0x2c2fb6.removeChild(_0x456645[0]);
              this.friendRowNotif(_0x2c2fb6, _0x227b92);
            } else {
              this.friendRowNotif(_0x2c2fb6, 1);
            }
          }
        }
      } else {
        if (_0xeb1fbf.s == 1) {
          break;
        }
        if (!this.unreadChannels.hasOwnProperty(_0x5871f5)) {
          this.unreadChannels[_0x5871f5] = 1;
        }
        let _0x3dbf99 = Object.keys(this.unreadChannels).length;
        this.friendsNotif(_0x3dbf99);
        this.notifSoundDM();
      }
      break;
    case 99:
      this.friendsError = _0xeb1fbf.e;
      this.forcedReconDelay = 20000;
      if (this.friendsOpened) {
        this.decideFriendsBoxMode();
      }
  }
};
Friends.prototype.checkNewFriend = function (_0x9c582d) {
  if (!Array.isArray(this.friends) || this.friends.length === 0) {
    this.requestRefresh();
    return;
  }
  let _0x148f6f = false;
  let _0x2a213c = false;
  for (
    let _0x1947ee = 0;
    _0x1947ee < this.friends.length;
    ++_0x1947ee
  ) {
    let _0x51bf9a = this.friends[_0x1947ee];
    if (_0x51bf9a.n == _0x9c582d) {
      if (!_0x51bf9a.s) {
        _0x148f6f = false;
        break;
      }
      _0x2a213c = true;
      break;
    }
  }
  if (!_0x2a213c || !!_0x148f6f) {
    this.requestRefresh();
  }
};
Friends.prototype.notifSoundDM = function () {
  if (!this.Live.p.Settings.DMsound) {
    return;
  }
  let _0x479cbe = this.Live.p.timestamp();
  if (
    !this.lastNotifSound ||
    _0x479cbe - this.lastNotifSound > 1000
  ) {
    createjs.Sound.play("msg");
    this.lastNotifSound = _0x479cbe;
  }
};
Friends.prototype.friendsNotif = function (_0x2eb90b) {
  this.Live.friendsBtn.className = "friNew";
  if (!this.notifElem) {
    this.notifElem = document.createElement("div");
    this.Live.friendsBtn.appendChild(this.notifElem);
  }
  this.notifElem.className = "frNotif";
  if (_0x2eb90b > 0) {
    this.notifElem.textContent = Math.min(99, _0x2eb90b);
    this.notifElem.classList.remove("newTag");
  } else if (_0x2eb90b === -1) {
    this.notifElem.textContent = "NEW";
    this.notifElem.classList.add("newTag");
  }
  showElem(this.notifElem);
};
Friends.prototype.friendRowNotif = function (_0xdc9129, _0x555e81) {
  _0xdc9129.classList.add("newMsg");
  let _0x279f12 = document.createElement("div");
  _0x279f12.className = "msgNotif";
  _0x279f12.textContent = Math.min(99, _0x555e81);
  _0xdc9129.appendChild(_0x279f12);
};
Friends.prototype.tryRenderInvite = function (
  _0x49bbfe,
  _0x2381b3,
  _0x1c0fee,
) {
  if (typeof _0x49bbfe != "string") {
    return _0x49bbfe;
  }
  let _0x1a5327 = _0x49bbfe.match(/^\[INV:([\w]+):(.*)\]$/);
  if (_0x1a5327) {
    let _0x1b96ba = _0x1a5327[1];
    let _0x1d4243 = _0x1a5327[2];
    let _0x1edf1c = document.createElement("div");
    _0x1edf1c.className = "inviteBox";
    _0x1edf1c.innerHTML = getSVG("s-envelope", "dark", "");
    let _0x3395e = document.createElement("span");
    _0x3395e.innerHTML = trans(i18n.frInvTo, {
      room: '<b class="invRoomName"></b>',
    });
    let _0x4f4ef3 = _0x3395e.querySelector(".invRoomName");
    if (_0x4f4ef3) {
      let _0x38b759 = document.createElement("textarea");
      _0x38b759.innerHTML = String(_0x1d4243);
      _0x4f4ef3.textContent = _0x38b759.value;
    }
    _0x1edf1c.appendChild(_0x3395e);
    var _0x33f1d4 = new Date(_0x1c0fee * 1000);
    let _0x2f22e9 =
      _0x33f1d4.getHours() +
      ":" +
      ("0" + _0x33f1d4.getMinutes()).substr(-2);
    let _0xa08e06 = document.createElement("span");
    _0xa08e06.className = "invInfo";
    _0xa08e06.innerHTML =
      _0x2f22e9 +
      "<br>" +
      trans(i18n.frInvBy, {
        user: _0x2381b3,
      });
    _0x1edf1c.appendChild(_0xa08e06);
    if (_0x1b96ba != this.Live.rid) {
      _0x1edf1c.addEventListener("click", function (_0x3cc37a) {
        window.joinRoom(_0x1b96ba);
      });
    } else if (typeof $ == "function") {
      $(_0x1edf1c).tooltip({
        title: i18n.frInvIn,
        template: this.ttClass("ttch"),
        viewport: {
          selector: "body",
          padding: -10000,
        },
      });
    }
    return _0x1edf1c;
  }
  return _0x49bbfe;
};
Friends.prototype.showInChat = function (
  _0x5081f3,
  _0x2448cf,
  _0x3011bf,
  _0x2209a2,
) {
  var _0x4c13dc =
    _0x5081f3 === "" ? "" : "<b>" + _0x5081f3 + ": </b>";
  var _0x22e205 = _0x5081f3 === "" ? "srv" : "";
  _0x2448cf = this.tryRenderInvite(_0x2448cf, _0x5081f3, _0x2209a2);
  var _0x4baaa8 = document.createElement("div");
  _0x4baaa8.classList.add("chl");
  if (typeof _0x3011bf == "object" && _0x3011bf !== null) {
    _0x4baaa8.classList.add(_0x3011bf);
  }
  if (_0x22e205) {
    _0x4baaa8.classList.add(_0x22e205);
  }
  if (_0x2448cf instanceof HTMLDivElement) {
    _0x4baaa8.appendChild(_0x2448cf);
  } else {
    _0x4baaa8.innerHTML = _0x4c13dc + _0x2448cf;
  }
  this.Live.friendsBox.appendChild(_0x4baaa8);
  this.Live.chatArea.scrollTop = this.Live.chatArea.scrollHeight;
};
Friends.prototype.getCategorySeparator = function (_0x15ac49) {
  let _0x48bbe9 = document.createElement("div");
  _0x48bbe9.classList.add("sep");
  if (_0x15ac49) {
    _0x48bbe9.classList.add("on");
    _0x48bbe9.textContent = i18n.frOn;
  } else {
    _0x48bbe9.textContent = i18n.frOff;
  }
  return _0x48bbe9;
};
Friends.prototype.requestRefresh = function () {
  let _0x2878d3 = JSON.stringify({
    t: 2,
  });
  this.safeSend(_0x2878d3);
  this.openChatName = null;
  if (!this.connected()) {
    this.loadingScreen("Reconnecting...");
  }
};
Friends.prototype.sendStatus = function (
  _0xec4da6,
  _0xae2f89,
  _0x2b18d2,
) {
  this.statusData = {
    t: 3,
    r: _0xec4da6,
    p: !_0xae2f89,
    n: _0x2b18d2.substring(0, 30),
  };
  let _0x2c5ce5 = JSON.stringify(this.statusData);
  if (this.connected()) {
    this.safeSend(_0x2c5ce5);
  } else {
    this.pendingStatus = _0x2c5ce5;
  }
  if (this.friendsOpened && this.friendsCount) {
    this.requestRefresh();
  }
};
Friends.prototype.openChat = function (_0x50f6eb) {
  let _0x4de7b4 = JSON.stringify({
    t: 4,
    u: _0x50f6eb,
  });
  this.safeSend(_0x4de7b4);
  this.Live.friendsBox.innerHTML = "";
  this.Live.friendsBox.className = "fchat";
  let _0x439404 = document.createElement("h3");
  _0x439404.className = "chatHeader";
  _0x439404.textContent = _0x50f6eb;
  let _0x50c9c5 = document.createElement("button");
  _0x50c9c5.innerHTML = getSVG("s-exit", "dark", "");
  _0x50c9c5.addEventListener("click", this.requestRefresh.bind(this));
  _0x50c9c5.className = "exitDM";
  this.dmChatBackButton = _0x50c9c5;
  _0x439404.appendChild(_0x50c9c5);
  let _0x3e4eef = document.createElement("button");
  _0x3e4eef.innerHTML = getSVG("s-envelope", "dark", "");
  _0x3e4eef.addEventListener("click", this.sendInvite.bind(this));
  _0x3e4eef.className = "inviteDM";
  if (typeof $ == "function") {
    $(_0x3e4eef).tooltip({
      title: i18n.frInv,
      viewport: {
        selector: "body",
        padding: -10000,
      },
    });
  }
  _0x439404.appendChild(_0x3e4eef);
  let _0x5487f8 = this.Live.chatArea;
  if (this.chatHeader) {
    this.chatBox.removeChild(this.chatHeader);
    this.chatHeader = null;
  }
  this.chatHeader = _0x439404;
  this.chatBox.insertBefore(_0x439404, _0x5487f8);
  this.Live.chatInput.placeholder = trans(i18n.frMsgTo, {
    name: _0x50f6eb,
  });
  this.openChatName = _0x50f6eb;
};
Friends.prototype.ttClass = function (_0x585833) {
  return (
    '<div class="tooltip ' +
    _0x585833 +
    '" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
  );
};
Friends.prototype.updateFriendList = function () {
  let _0x5e60dd = this;
  this.openChatName = null;
  this.Live.chatInput.placeholder = "";
  this.Live.friendsBox.innerHTML = "";
  this.Live.friendsBox.className = "flist";
  this.Live.chatArea.style.paddingTop = null;
  if (this.chatHeader) {
    this.chatBox.removeChild(this.chatHeader);
    this.chatHeader = null;
  }
  let _0x25f454 = document.createElement("h3");
  _0x25f454.textContent = i18n.fr;
  let _0x4d0dc9 = document.createElement("button");
  _0x4d0dc9.title = i18n.frRel;
  _0x4d0dc9.innerHTML = getSVG("s-reload", "dark", "");
  _0x4d0dc9.addEventListener("click", this.requestRefresh.bind(this));
  _0x25f454.appendChild(_0x4d0dc9);
  this.Live.friendsBox.appendChild(_0x25f454);
  this.friends.sort(function (_0x1b7118, _0x1863ed) {
    if (_0x1b7118.s != _0x1863ed.s) {
      if (_0x1b7118.s && !_0x1863ed.s) {
        return -1;
      } else {
        return 1;
      }
    } else if (_0x1b7118.c && !_0x1863ed.c) {
      return -1;
    } else if (_0x1863ed.c && !_0x1b7118.c) {
      return 1;
    } else {
      return _0x1b7118.n.localeCompare(_0x1863ed.n);
    }
  });
  let _0x580f05 = null;
  for (
    let _0x393eb1 = 0;
    _0x393eb1 < this.friends.length;
    ++_0x393eb1
  ) {
    let _0x352dc8 = this.friends[_0x393eb1];
    if (_0x580f05 !== _0x352dc8.s) {
      _0x580f05 = _0x352dc8.s;
      this.Live.friendsBox.appendChild(
        this.getCategorySeparator(_0x580f05),
      );
    }
    let _0x56a3d0 = document.createElement("div");
    _0x56a3d0.className = "fr";
    _0x56a3d0.id = "fr-" + _0x352dc8.n;
    let _0x4a54b4 = document.createElement("a");
    _0x4a54b4.target = "_blank";
    _0x4a54b4.href = "/u/" + _0x352dc8.n;
    _0x4a54b4.textContent = _0x352dc8.n;
    _0x56a3d0.appendChild(_0x4a54b4);
    let _0x4b39af = document.createElement("button");
    _0x4b39af.title = i18n.frChat;
    _0x4b39af.classList.add("f-ch");
    if (_0x352dc8.c) {
      this.friendRowNotif(_0x4b39af, _0x352dc8.c);
    }
    _0x4b39af.addEventListener("click", function () {
      _0x5e60dd.openChat(_0x352dc8.n);
    });
    _0x56a3d0.appendChild(_0x4b39af);
    if (_0x352dc8.s) {
      let _0x4bc0b0 = document.createElement("button");
      let _0x17751b = "";
      if (_0x352dc8.r && this.Live.rid != _0x352dc8.r) {
        _0x4bc0b0.addEventListener("click", function (_0x5b651d) {
          if (_0x5b651d.target.hasAttribute("aria-describedby")) {
            let _0x2e0917 = _0x5b651d.target.getAttribute(
              "aria-describedby",
            );
            let _0x5b6088 = document.getElementById(_0x2e0917);
            if (_0x5b6088) {
              _0x5b6088.parentNode.removeChild(_0x5b6088);
            }
          }
          window.joinRoom(_0x352dc8.r);
        });
        if (_0x352dc8.a) {
          _0x17751b = _0x352dc8.a;
        }
      } else {
        _0x4bc0b0.classList.add("disBtn");
        if (_0x352dc8.r) {
          if (this.Live.rid == _0x352dc8.r) {
            _0x17751b = i18n.frIn;
          }
        } else {
          _0x17751b = i18n.frPriv;
        }
      }
      if (_0x17751b && typeof $ == "function") {
        $(_0x4bc0b0).tooltip({
          title: _0x17751b,
          template: this.ttClass("ttch"),
          html: true,
          viewport: {
            selector: "body",
            padding: -10000,
          },
        });
      }
      _0x4bc0b0.classList.add("f-jo");
      _0x56a3d0.appendChild(_0x4bc0b0);
    }
    this.Live.friendsBox.appendChild(_0x56a3d0);
  }
};
Friends.prototype.loadingScreen = function (_0xbc7394, _0x5ee95e) {
  if (this.friendsOpened) {
    this.Live.friendsBox.style.display = "flex";
    this.Live.friendsBox.innerHTML = "";
    var _0x3eecb4 = document.createElement("img");
    if (_0x5ee95e) {
      if (_0x5ee95e === 1) {
        _0x3eecb4.src = CDN_URL("/res/svg/cancel.svg");
      }
    } else {
      _0x3eecb4.src = CDN_URL("/res/svg/spinWhite.svg");
    }
    _0x3eecb4.style.width = "27px";
    var _0x15ef7f = document.createElement("span");
    _0x15ef7f.innerHTML = _0xbc7394;
    this.Live.friendsBox.appendChild(_0x3eecb4);
    this.Live.friendsBox.appendChild(_0x15ef7f);
    this.Live.friendsBox.className = "fempty";
  }
};
Friends.prototype.friendBoxMode = function (_0x2f3e89) {
  this.Live.friendsBox.className = "";
  if (_0x2f3e89 === this.VIEW_MODE.FRIEND_LIST_LOADING) {
    this.loadingScreen(i18n.frLoad);
  } else if (_0x2f3e89 === this.VIEW_MODE.LOGIN_FIRST) {
    this.loadingScreen(i18n.frLogin, 1);
  } else if (_0x2f3e89 === this.VIEW_MODE.TOO_MANY_CONN) {
    this.loadingScreen(
      "Account is already connected multiple times.<br>Close other connections.",
      1,
    );
  } else if (_0x2f3e89 === this.VIEW_MODE.NO_FRIENDS) {
    this.Live.friendsBox.style.display = "flex";
    this.Live.friendsBox.innerHTML =
      "<h1>" + i18n.frEmpty + "</h1>" + i18n.frHowAdd;
    this.Live.friendsBox.className = "fempty";
  } else if (_0x2f3e89 === this.VIEW_MODE.FRIEND_LIST) {
    this.requestRefresh();
    this.Live.friendsBox.style.display = "block";
    this.updateFriendList();
    if (
      this.friends &&
      this.friends.length > 2 &&
      this.chatBox.clientHeight < 140 &&
      !this.Live.p.GS.chatExpanded
    ) {
      this.Live.p.GS.chatExpand();
    }
  } else if (_0x2f3e89 === this.VIEW_MODE.INTRO) {
    if (!this.friendsOpened) {
      return;
    }
    if (
      this.chatBox.clientHeight < 153 &&
      !this.Live.p.GS.chatExpanded
    ) {
      this.Live.p.GS.chatExpand();
    }
    this.Live.friendsBox.innerHTML =
      '<h1 style="font-size: 20px;margin-top: 3px;">' +
      i18n.frWelc +
      '</h1><ul style="margin-bottom: 7px;margin-left: -13px;"><li>' +
      i18n.frIntro +
      "</li><li>" +
      i18n.frIntro2 +
      "</li><li>" +
      trans(i18n.frIntro3, {
        frPage:
          '<a target="_blank" href="/friends">' +
          i18n.frPage +
          "</a>",
      }) +
      "</li></ul>";
    let _0xb5bb31 = document.createElement("button");
    _0xb5bb31.textContent = i18n.frIntroCl;
    _0xb5bb31.style.border = "none";
    _0xb5bb31.style.padding = "4px 29px";
    _0xb5bb31.addEventListener(
      "click",
      this.decideFriendsBoxMode.bind(this),
    );
    this.Live.friendsBox.appendChild(_0xb5bb31);
    localStorage.setItem("frN", 1);
  }
};
Friends.prototype.viewIntro = function () {
  return localStorage.getItem("frN") === null;
};
Friends.prototype.decideFriendsBoxMode = function () {
  if (this.viewIntro()) {
    this.friendBoxMode(this.VIEW_MODE.INTRO);
  } else if (this.Live.authorized) {
    if (this.friendsError === 1) {
      this.friendBoxMode(this.VIEW_MODE.TOO_MANY_CONN);
    } else if (this.friendsCount === 0) {
      this.friendBoxMode(this.VIEW_MODE.NO_FRIENDS);
    } else if (this.friendsCount === null || this.friends === null) {
      this.friendBoxMode(this.VIEW_MODE.FRIEND_LIST_LOADING);
    } else {
      this.friendBoxMode(this.VIEW_MODE.FRIEND_LIST);
    }
  } else {
    this.friendBoxMode(this.VIEW_MODE.LOGIN_FIRST);
  }
};
Friends.prototype.openFriends = function () {
  this.friendsOpened = !this.friendsOpened;
  hideElem(this.notifElem);
  if (this.friendsOpened) {
    this.Live.friendsBtn.className = "rch";
    this.Live.chatBox.style.display = "none";
    this.Live.removeScrollButton();
    this.Live.friendsBtn.setAttribute(
      "data-original-title",
      "Room chat",
    );
    if (
      this.chatBox.clientHeight < 100 &&
      !this.Live.p.GS.chatExpanded
    ) {
      this.Live.p.GS.chatExpand();
    }
    this.decideFriendsBoxMode();
  } else {
    this.Live.friendsBtn.className = "fri";
    this.Live.chatBox.style.display = "block";
    this.Live.friendsBox.style.display = "none";
    this.Live.chatArea.style.paddingTop = null;
    this.Live.chatInput.placeholder = "";
    if (this.chatHeader) {
      this.chatBox.removeChild(this.chatHeader);
      this.chatHeader = null;
    }
    this.Live.friendsBtn.setAttribute(
      "data-original-title",
      "Friends",
    );
    this.Live.scrollOnMessage(true);
  }
  if (this.Live.friendsBtn.hasAttribute("aria-describedby")) {
    let _0x47a193 = this.Live.friendsBtn.getAttribute(
      "aria-describedby",
    );
    hideElem(document.getElementById(_0x47a193));
  }
};
Friends.prototype.onClose = function () {
  if (this.connectionTimeout) {
    clearTimeout(this.connectionTimeout);
    this.connectionTimeout = null;
  }
  this.reconnect();
};
(function () {
  window.onload = function () {
    (_0x185322 = new Game()).start();
    settingsTabs.init();
    document.addEventListener(
      "keydown",
      _0x185322.keyInput2.bind(_0x185322),
      false,
    );
    document.addEventListener(
      "keyup",
      _0x185322.keyInput3.bind(_0x185322),
      false,
    );
    document.getElementById("main").addEventListener(
      "click",
      function () {
        _0x185322.setFocusState(0);
      },
      true,
    );
    document.getElementById("createRoom").addEventListener(
      "click",
      function () {
        _0x185322.setFocusState(1);
      },
      true,
    );
    document.getElementById("settingsBox").addEventListener(
      "click",
      function () {
        _0x185322.setFocusState(1);
      },
      true,
    );
    document.getElementById("chatBox").addEventListener(
      "click",
      function () {
        _0x185322.setFocusState(1);
      },
      true,
    );
    document
      .getElementById("chatBox")
      .addEventListener(
        "scroll",
        _0x185322.Live.onChatScroll.bind(_0x185322.Live),
        true,
      );
    document.getElementById("lobbyBox").addEventListener(
      "click",
      function () {
        _0x185322.setFocusState(1);
      },
      true,
    );
    document.getElementById("showMore").onclick =
      _0x185322.Live.toggleMore.bind(_0x185322.Live);
    document.getElementById("moreClose").onclick =
      _0x185322.Live.toggleMore.bind(_0x185322.Live);
    document.getElementById("cancelCreation").onclick =
      _0x185322.Live.closeRoomDialog.bind(_0x185322.Live);
    document.getElementById("createRoomButton").onclick =
      _0x185322.Live.showRoomDialog.bind(_0x185322.Live);
    document.getElementById("editRoomButton").onclick =
      _0x185322.Live.showRoomDialogForEdit.bind(_0x185322.Live);
    document.getElementById("lobby").onclick =
      _0x185322.Live.toggleLobbby.bind(_0x185322.Live);
    document.getElementById("refreshLobby").onclick =
      _0x185322.Live.refreshLobbby.bind(_0x185322.Live);
    document.getElementById("settings").onclick = function () {
      _0x185322.Settings.openSettings();
      _0x185322.setFocusState(1);
    };
    document.getElementById("res").onclick =
      _0x185322.Live.sendRestartEvent.bind(_0x185322.Live);
    document.getElementById("closeLobby").onclick =
      _0x185322.Live.toggleLobbby.bind(_0x185322.Live);
    document.getElementById("closeLink").onclick =
      _0x185322.Live.hideResults.bind(_0x185322.Live);
    document.getElementById("create").onclick =
      _0x185322.Live.makeRoomWrapper.bind(_0x185322.Live);
    document.getElementById("sendMsg").onclick =
      _0x185322.Live.sendChat.bind(_0x185322.Live);
    document.getElementById("myCanvas").onclick = function () {
      if (!_0x185322.Live.sitout && _0x185322.focusState) {
        _0x185322.redraw();
      }
      _0x185322.setFocusState(0);
    };
    document.getElementById("chatInput").onclick = function () {
      _0x185322.setFocusState(1);
    };
    document.getElementById("chatInput").onfocus = function () {
      _0x185322.setFocusState(1);
    };
    document
      .getElementById("chatInput")
      .addEventListener("keydown", function (_0x1f2f26) {
        if (_0x1f2f26.keyCode === 13) {
          _0x185322.Live.sendChat();
        }
      });
    document.getElementById("more-practice").onclick =
      _0x185322.Live.toggleMorePractice.bind(_0x185322.Live, false);
    document.getElementById("hasSolid").onclick = function () {
      document.getElementById("solid").disabled =
        !document.getElementById("hasSolid").checked;
    };
    document.getElementById("ghost").onclick = function () {
      _0x185322.ghostEnabled =
        document.getElementById("ghost").checked;
      if (_0x185322.play && _0x185322.ghostEnabled) {
        _0x185322.updateGhostPiece();
        _0x185322.redraw();
      }
    };
    document.getElementById("more_simple").onclick = function () {
      _0x185322.Live.switchRDmode(0);
    };
    document.getElementById("more_adv").onclick = function () {
      _0x185322.Live.switchRDmode(1);
    };
    document.getElementById("more_preset").onclick = function () {
      _0x185322.Live.switchRDmode(2);
    };
    document.getElementById("saveRD").onclick = function () {
      _0x185322.Live.saveRD();
    };
    document.getElementById("saveDataClose").onclick = function () {
      this.parentElement.style.display = "none";
    };
    document.getElementById("addJL").onclick = function () {
      showElem(document.getElementById("joinLimits"));
    };
    document.getElementById("saveLimits").onclick = function () {
      hideElem(document.getElementById("joinLimits"));
    };
    document.getElementById("attackMode").onchange = function () {
      _0x185322.Live.attackSelect();
    };
    document.getElementById("presetSel").onchange = function () {
      _0x185322.Live.onPresetChange();
    };
    document.getElementById("customPre").onclick = function () {
      _0x185322.Live.useCustomPreset();
    };
    document.getElementById("nullpoDAS").onclick =
      _0x185322.Settings.nullpoDAS.bind(_0x185322.Settings);
    document.getElementById("sfxSelect").onchange = soundCredits;
    document.getElementById("vsfxSelect").onchange = soundCredits;
    document.getElementById("chatExpand").onclick =
      _0x185322.GS.chatExpand.bind(_0x185322.GS);
    window.addEventListener(
      "blur",
      function () {
        _0x185322.browserTabFocusChange(0);
      },
      false,
    );
    window.addEventListener(
      "focus",
      function () {
        _0x185322.browserTabFocusChange(1);
      },
      false,
    );
    window.addEventListener(
      "gamepadconnected",
      _0x185322.Settings.initGamePad.bind(_0x185322.Settings),
    );
    window.addEventListener(
      "gamepaddisconnected",
      _0x185322.Settings.removeGamePad.bind(_0x185322.Settings),
    );
    document
      .getElementById("vol-control")
      .addEventListener("input", function () {
        _0x185322.Settings.volumeChange(this.value);
      });
    document.getElementById("slotSettingsBtn").addEventListener(
      "click",
      function () {
        var _0x2b1bff = document.getElementById("slotSettingsBtn");
        var _0x4c5b65 = document.getElementById("slotSettings");
        _0x2b1bff.classList.toggle("zoomIc");
        _0x2b1bff.classList.toggle("okIc");
        toggleElem(_0x4c5b65);
      },
      false,
    );
    document.getElementById("slotSettings").addEventListener(
      "click",
      function (_0x4694d1) {
        _0x4694d1.stopImmediatePropagation();
      },
      false,
    );
    document.getElementById("zoomControl").onchange = function () {
      var _0x48c33c = parseInt(
        document.getElementById("zoomControl").value,
      );
      document.getElementById("zoomNow").innerHTML = _0x48c33c + "%";
      _0x185322.GS.setZoom.call(_0x185322.GS, _0x48c33c);
    };
    document.getElementById("fsSlots").onclick = function () {
      _0x185322.GS.fullScreen.call(
        _0x185322.GS,
        document.getElementById("fsSlots").checked,
      );
    };
    document.getElementById("hqSlots").onclick = function () {
      _0x185322.GS.forceExtended =
        document.getElementById("hqSlots").checked;
      _0x185322.GS.autoScale.call(_0x185322.GS);
    };
    document.getElementById("statsSlots").onclick = function () {
      _0x185322.GS.slotStats =
        document.getElementById("statsSlots").checked;
      _0x185322.GS.autoScale.call(_0x185322.GS);
    };
    window.joinRoom = _0x2e71fc;
    window.loadSkin = _0x4e9b3e;
    window.loadVideoSkin = _0x56bd39;
    window.loadGhostSkin = _0x185322.loadGhostSkin.bind(_0x185322);
    window.loadSFX = _0x288ab2;
    for (
      var _0x19f332 = 0;
      _0x19f332 < document.gridForm.grs.length;
      _0x19f332++
    ) {
      document.gridForm.grs[_0x19f332].onclick = function () {
        _0x185322.Settings.setGrid(parseInt(this.value));
      };
    }
    function _0x326e40() {
      try {
        if (
          createjs.WebAudioPlugin.context &&
          createjs.WebAudioPlugin.context.state === "suspended"
        ) {
          createjs.WebAudioPlugin.context.resume();
          window.removeEventListener("click", _0x326e40);
        }
      } catch (_0x228b1f) {
        console.error(
          "Error while trying to resume the Web Audio context.",
        );
        console.error(_0x228b1f);
      }
    }
    window.addEventListener("click", _0x326e40);
    var _0x270275;
    var _0xc7131c = false;
    var _0x4facb7 = document.getElementById("main");
    function _0x2de5dd() {
      _0x4facb7.style.cursor = "none";
      _0xc7131c = true;
      setTimeout(function () {
        _0xc7131c = false;
      }, 100);
    }
    _0x4facb7.addEventListener("mousemove", function () {
      if (!_0xc7131c) {
        _0xc7131c = false;
        clearTimeout(_0x270275);
        _0x4facb7.style.cursor = null;
        _0x270275 = setTimeout(_0x2de5dd, 3000);
      }
    });
  };
  var _0x185322 = undefined;
  function _0x4e9b3e(_0x401751, _0x3cd54f, _0xaef1ef) {
    _0x185322.skins[1].data = _0x401751;
    _0x185322.skins[1].w = _0x3cd54f;
    _0x185322.skins[1].cdn = false;
    _0x185322.changeSkin(1);
    if (_0xaef1ef && _0xaef1ef.global) {
      _0x185322.GS.skinOverride = _0x185322.skins[1];
      _0x185322.GS.slots.forEach(function (_0xad17e5) {
        _0xad17e5.v.changeSkin(1);
      });
    }
  }
  function _0x56bd39(_0x2277d4, _0x289339) {
    _0x289339 = _0x289339 || {};
    if (_0x185322.v.NAME === "webGL") {
      if (_0x2277d4.split(".").pop() !== "gif") {
        _0x185322.v.setupVideo(_0x2277d4, _0x289339);
      } else {
        _0x185322.v.setupGif(_0x2277d4, _0x289339);
      }
    } else {
      alert("Enable webGL before using loadVideoSkin!");
    }
  }
  function _0x288ab2(_0x3c0983, _0x2a178c) {
    _0x185322.changeSFX(_0x3c0983, _0x2a178c);
  }
  function _0x2e71fc(_0x554706) {
    _0x185322.Live.joinRoom(_0x554706);
  }
  if (typeof $ == "function") {
    $('[data-toggle="tooltip"]').tooltip({
      viewport: {
        selector: "body",
        padding: -10000,
      },
    });
    $(window).on("modal-opened", () => {
      _0x185322.setFocusState(1);
    });
  }
})();
ChatAutocomplete.prototype.clearEmotes = function () {
  this.hintsImg = {};
  this.hints = [];
};
ChatAutocomplete.prototype.initEmoteHints = function () {
  this.hintsImg = {};
  this.hints = Object.keys(this.hintsImg);
};
ChatAutocomplete.prototype.addEmotes = function (_0x1e8583) {
  const _0x5aae76 = this.addEmoteSurrounder;
  for (const _0x43d2cd of _0x1e8583) {
    let _0x52f154 = _0x5aae76 + _0x43d2cd.n + _0x5aae76;
    this.hints.push(_0x52f154);
    if (_0x43d2cd.u) {
      this.hintsImg[_0x52f154] = _0x43d2cd.u;
    } else {
      this.hintsImg[_0x52f154] = "res/oe/" + _0x43d2cd.n + ".svg";
    }
  }
  this.moreEmotesAdded = true;
};
ChatAutocomplete.prototype.loadEmotesIndex = function (_0x1c51fa) {
  if (!this.moreEmotesAdded) {
    var _0x4f6fb4 = new XMLHttpRequest();
    var _0x70bd4e = "/code/emotes";
    if (_0x1c51fa && _0x1c51fa !== "") {
      _0x70bd4e +=
        _0x1c51fa.indexOf("=") !== -1
          ? "?" + _0x1c51fa
          : "?v=" + _0x1c51fa;
    }
    _0x4f6fb4.timeout = 8000;
    _0x4f6fb4.open("GET", _0x70bd4e, true);
    try {
      _0x4f6fb4.send();
    } catch (_0x15f5c2) {}
    var _0x3c9c3a = this;
    _0x4f6fb4.ontimeout = function () {};
    _0x4f6fb4.onerror = _0x4f6fb4.onabort = function () {};
    _0x4f6fb4.onload = function () {
      if (_0x4f6fb4.status === 200) {
        let _0x4829e3 = JSON.parse(_0x4f6fb4.responseText);
        if (_0x3c9c3a.preProcessEmotes !== null) {
          _0x4829e3 = _0x3c9c3a.preProcessEmotes(_0x4829e3);
        }
        _0x3c9c3a.addEmotes(_0x4829e3);
        if (_0x3c9c3a.onEmoteObjectReady !== null) {
          _0x3c9c3a.onEmoteObjectReady(_0x4829e3);
        }
      }
    };
  }
};
ChatAutocomplete.prototype.init = function () {
  var _0x4a6040 = this;
  this.inp.addEventListener(
    "input",
    function (_0x4a3165) {
      var _0xca28a = _0x4a6040.getCurrentWord();
      _0x4a6040.processHint(_0xca28a);
    },
    false,
  );
  if (this.prfx === "") {
    this.inp.addEventListener("focus", function (_0xd4b897) {
      var _0xa8d8a7 = _0x4a6040.getCurrentWord();
      _0x4a6040.processHint(_0xa8d8a7);
    });
  }
  this.inp.addEventListener(
    "keydown",
    function (_0x5c58e1) {
      if (_0x4a6040.hintsElem.style.display !== "none") {
        if (_0x5c58e1.keyCode === 38 || _0x5c58e1.keyCode === 40) {
          _0x4a6040.moveSelected(_0x5c58e1.keyCode === 38 ? -1 : 1);
          _0x5c58e1.preventDefault();
        } else if (
          _0x5c58e1.keyCode === 13 &&
          this.selectedIndex !== null
        ) {
          _0x4a6040.hintsElem.childNodes[
            _0x4a6040.selectedIndex
          ].click();
          _0x5c58e1.preventDefault();
          _0x5c58e1.stopImmediatePropagation();
        }
      }
    },
    true,
  );
};
ChatAutocomplete.prototype.moveSelected = function (_0x40f3c2) {
  var _0x3a1c3e = this.hintsElem.childNodes;
  this.hintsElem.childNodes[this.selectedIndex].classList.remove(
    "ksel",
  );
  this.selectedIndex =
    (_0x3a1c3e.length + this.selectedIndex + _0x40f3c2) %
    _0x3a1c3e.length;
  this.setSelected(this.selectedIndex);
};
ChatAutocomplete.prototype.setSelected = function (_0x49ed83) {
  if (_0x49ed83 >= this.hintsElem.childNodes.length) {
    this.selectedIndex = null;
  } else {
    this.selectedIndex = _0x49ed83;
    this.hintsElem.childNodes[this.selectedIndex].classList.add(
      "ksel",
    );
  }
};
ChatAutocomplete.prototype.processHint = function (_0x5d44bb) {
  var _0x57e81c = _0x5d44bb[0].toLowerCase();
  var _0x1b0c0c = _0x5d44bb[1];
  if (
    this.prfx !== "" &&
    (_0x57e81c === null ||
      _0x57e81c.length < this.minimalLengthForHint ||
      _0x57e81c[0] !== this.prfx)
  ) {
    hideElem(this.hintsElem);
  } else {
    _0xc18890 = _0xc18890;
    var _0x2b2a20 = _0x57e81c.substring(this.prfx.length);
    var _0xc18890 = this.prefixInSearch ? _0x57e81c : _0x2b2a20;
    var _0x1100b7 = 0;
    var _0xda11b5 =
      typeof this.hints == "function" ? this.hints() : this.hints;
    this.hintsElem.innerHTML = "";
    var _0x2a9bbe = [];
    var _0x43ec3a = [];
    for (var _0x5c0d26 in _0xda11b5) {
      var _0x155f6b = (_0x139ff5 =
        _0xda11b5[_0x5c0d26]).toLowerCase();
      if (_0x155f6b.startsWith(_0xc18890)) {
        _0x2a9bbe.push(_0x139ff5);
      } else if (
        _0x2b2a20.length >= 2 &&
        _0x155f6b.includes(_0x2b2a20)
      ) {
        _0x43ec3a.push(_0x139ff5);
      }
    }
    _0x2a9bbe.sort();
    if (_0x2a9bbe.length < this.maxPerHint) {
      _0x43ec3a.sort();
      for (const _0x25686d of _0x43ec3a) {
        if (
          _0x2a9bbe.indexOf(_0x25686d) === -1 &&
          (_0x2a9bbe.push(_0x25686d),
          _0x2a9bbe.length >= this.maxPerHint)
        ) {
          break;
        }
      }
    }
    for (var _0x139ff5 of _0x2a9bbe) {
      var _0xa1b12f = document.createElement("div");
      if (this.hintsImg && this.hintsImg[_0x139ff5]) {
        _0xa1b12f.className = "emHint";
        var _0x301aa6 = document.createElement("img");
        _0x301aa6.src = CDN_URL("/" + this.hintsImg[_0x139ff5]);
        _0xa1b12f.appendChild(_0x301aa6);
        var _0x55239b = document.createElement("div");
        _0x55239b.textContent = _0x139ff5;
        _0xa1b12f.appendChild(_0x55239b);
      } else {
        _0xa1b12f.innerHTML = _0x139ff5;
      }
      _0xa1b12f.dataset.pos = _0x1b0c0c;
      _0xa1b12f.dataset.str = _0x139ff5;
      var _0x34a934 = this;
      _0xa1b12f.addEventListener(
        "click",
        function (_0x3ded09) {
          var _0x17ca37 = _0x34a934.inp.value;
          var _0x234bd2 = parseInt(this.dataset.pos);
          var _0x1ec07d = _0x17ca37.substring(0, _0x234bd2);
          var _0x14b2a8 = _0x1ec07d.indexOf(" ");
          var _0xcb5a75 = _0x14b2a8 + 1;
          for (; _0x14b2a8 !== -1; ) {
            if (
              (_0x14b2a8 = _0x1ec07d.indexOf(" ", _0x14b2a8 + 1)) !==
              -1
            ) {
              _0xcb5a75 = _0x14b2a8 + 1;
            }
          }
          if (!_0x34a934.prefixInSearch) {
            ++_0xcb5a75;
          }
          _0x34a934.inp.value =
            _0x17ca37.substring(0, _0xcb5a75) +
            this.dataset.str +
            " " +
            _0x17ca37.substring(_0x234bd2);
          _0x34a934.inp.focus();
          _0x34a934.setCaretPosition(
            _0x234bd2 +
              this.dataset.str.length +
              1 -
              (_0x234bd2 - _0xcb5a75),
          );
          hideElem(_0x34a934.hintsElem);
          if (_0x34a934.wipePrevious) {
            _0x34a934.inp.value = this.dataset.str;
            if (_0x34a934.onWiped) {
              _0x34a934.onWiped(this.dataset.str);
            }
          }
        },
        false,
      );
      this.hintsElem.appendChild(_0xa1b12f);
      if (++_0x1100b7 >= this.maxPerHint) {
        break;
      }
    }
    this.setSelected(0);
    if (_0x1100b7) {
      showElem(this.hintsElem);
    } else {
      hideElem(this.hintsElem);
    }
  }
};
ChatAutocomplete.prototype.ReturnWord = function (
  _0x14bb20,
  _0x104a0f,
) {
  var _0x502157 = _0x14bb20.substring(0, _0x104a0f);
  if (_0x502157.indexOf(" ") > 0) {
    var _0x198042 = _0x502157.split(" ");
    return _0x198042[_0x198042.length - 1];
  }
  return _0x502157;
};
ChatAutocomplete.prototype.getCurrentWord = function () {
  var _0x25cc45 = this.GetCaretPosition(this.inp);
  return [this.ReturnWord(this.inp.value, _0x25cc45), _0x25cc45];
};
ChatAutocomplete.prototype.GetCaretPosition = function (_0x1bd11d) {
  var _0x438c39 = 0;
  if (document.selection) {
    _0x1bd11d.focus();
    var _0x53da05 = document.selection.createRange();
    _0x53da05.moveStart("character", -_0x1bd11d.value.length);
    _0x438c39 = _0x53da05.text.length;
  } else if (
    _0x1bd11d.selectionStart ||
    _0x1bd11d.selectionStart == "0"
  ) {
    _0x438c39 = _0x1bd11d.selectionStart;
  }
  return _0x438c39;
};
ChatAutocomplete.prototype.setCaretPosition = function (_0xcd09fd) {
  _0xcd09fd = Math.max(Math.min(_0xcd09fd, this.inp.value.length), 0);
  if (this.inp.createTextRange) {
    var _0xe41f6c = this.inp.createTextRange();
    _0xe41f6c.moveStart("character", _0xcd09fd);
    _0xe41f6c.collapse();
    _0xe41f6c.select();
  } else {
    this.inp.focus();
    this.inp.setSelectionRange(_0xcd09fd, _0xcd09fd);
  }
};
Matrix.multiply = function (_0x1d90df, _0x5cd4d4, _0x33ab5f) {
  _0x33ab5f = _0x33ab5f || new Float32Array(16);
  var _0x56884f = _0x5cd4d4[0];
  var _0x369311 = _0x5cd4d4[1];
  var _0x2dc0ea = _0x5cd4d4[2];
  var _0x86182 = _0x5cd4d4[3];
  var _0x247922 = _0x5cd4d4[4];
  var _0x506a1e = _0x5cd4d4[5];
  var _0x43c84f = _0x5cd4d4[6];
  var _0x200bb9 = _0x5cd4d4[7];
  var _0x146984 = _0x5cd4d4[8];
  var _0x201579 = _0x5cd4d4[9];
  var _0x3db889 = _0x5cd4d4[10];
  var _0x4a9914 = _0x5cd4d4[11];
  var _0x221310 = _0x5cd4d4[12];
  var _0x2ae050 = _0x5cd4d4[13];
  var _0x3c1262 = _0x5cd4d4[14];
  var _0x3f9e72 = _0x5cd4d4[15];
  var _0x288420 = _0x1d90df[0];
  var _0x34fcaf = _0x1d90df[1];
  var _0x582160 = _0x1d90df[2];
  var _0x5debde = _0x1d90df[3];
  var _0xc41cf4 = _0x1d90df[4];
  var _0x22f4e2 = _0x1d90df[5];
  var _0x4c054b = _0x1d90df[6];
  var _0x24c120 = _0x1d90df[7];
  var _0x32ecd2 = _0x1d90df[8];
  var _0x5ce87c = _0x1d90df[9];
  var _0x5770d8 = _0x1d90df[10];
  var _0x5302c4 = _0x1d90df[11];
  var _0x5d0244 = _0x1d90df[12];
  var _0x51fd22 = _0x1d90df[13];
  var _0x1850e5 = _0x1d90df[14];
  var _0x5b4fb7 = _0x1d90df[15];
  _0x33ab5f[0] =
    _0x56884f * _0x288420 +
    _0x369311 * _0xc41cf4 +
    _0x2dc0ea * _0x32ecd2 +
    _0x86182 * _0x5d0244;
  _0x33ab5f[1] =
    _0x56884f * _0x34fcaf +
    _0x369311 * _0x22f4e2 +
    _0x2dc0ea * _0x5ce87c +
    _0x86182 * _0x51fd22;
  _0x33ab5f[2] =
    _0x56884f * _0x582160 +
    _0x369311 * _0x4c054b +
    _0x2dc0ea * _0x5770d8 +
    _0x86182 * _0x1850e5;
  _0x33ab5f[3] =
    _0x56884f * _0x5debde +
    _0x369311 * _0x24c120 +
    _0x2dc0ea * _0x5302c4 +
    _0x86182 * _0x5b4fb7;
  _0x33ab5f[4] =
    _0x247922 * _0x288420 +
    _0x506a1e * _0xc41cf4 +
    _0x43c84f * _0x32ecd2 +
    _0x200bb9 * _0x5d0244;
  _0x33ab5f[5] =
    _0x247922 * _0x34fcaf +
    _0x506a1e * _0x22f4e2 +
    _0x43c84f * _0x5ce87c +
    _0x200bb9 * _0x51fd22;
  _0x33ab5f[6] =
    _0x247922 * _0x582160 +
    _0x506a1e * _0x4c054b +
    _0x43c84f * _0x5770d8 +
    _0x200bb9 * _0x1850e5;
  _0x33ab5f[7] =
    _0x247922 * _0x5debde +
    _0x506a1e * _0x24c120 +
    _0x43c84f * _0x5302c4 +
    _0x200bb9 * _0x5b4fb7;
  _0x33ab5f[8] =
    _0x146984 * _0x288420 +
    _0x201579 * _0xc41cf4 +
    _0x3db889 * _0x32ecd2 +
    _0x4a9914 * _0x5d0244;
  _0x33ab5f[9] =
    _0x146984 * _0x34fcaf +
    _0x201579 * _0x22f4e2 +
    _0x3db889 * _0x5ce87c +
    _0x4a9914 * _0x51fd22;
  _0x33ab5f[10] =
    _0x146984 * _0x582160 +
    _0x201579 * _0x4c054b +
    _0x3db889 * _0x5770d8 +
    _0x4a9914 * _0x1850e5;
  _0x33ab5f[11] =
    _0x146984 * _0x5debde +
    _0x201579 * _0x24c120 +
    _0x3db889 * _0x5302c4 +
    _0x4a9914 * _0x5b4fb7;
  _0x33ab5f[12] =
    _0x221310 * _0x288420 +
    _0x2ae050 * _0xc41cf4 +
    _0x3c1262 * _0x32ecd2 +
    _0x3f9e72 * _0x5d0244;
  _0x33ab5f[13] =
    _0x221310 * _0x34fcaf +
    _0x2ae050 * _0x22f4e2 +
    _0x3c1262 * _0x5ce87c +
    _0x3f9e72 * _0x51fd22;
  _0x33ab5f[14] =
    _0x221310 * _0x582160 +
    _0x2ae050 * _0x4c054b +
    _0x3c1262 * _0x5770d8 +
    _0x3f9e72 * _0x1850e5;
  _0x33ab5f[15] =
    _0x221310 * _0x5debde +
    _0x2ae050 * _0x24c120 +
    _0x3c1262 * _0x5302c4 +
    _0x3f9e72 * _0x5b4fb7;
  return _0x33ab5f;
};
Matrix.orthographic = function (
  _0x348911,
  _0x51ccac,
  _0x22fe4d,
  _0x17bedc,
  _0x588e6c,
  _0x1e2a1b,
  _0xb5d1bb,
) {
  (_0xb5d1bb = _0xb5d1bb || new Float32Array(16))[0] =
    2 / (_0x51ccac - _0x348911);
  _0xb5d1bb[1] = 0;
  _0xb5d1bb[2] = 0;
  _0xb5d1bb[3] = 0;
  _0xb5d1bb[4] = 0;
  _0xb5d1bb[5] = 2 / (_0x17bedc - _0x22fe4d);
  _0xb5d1bb[6] = 0;
  _0xb5d1bb[7] = 0;
  _0xb5d1bb[8] = 0;
  _0xb5d1bb[9] = 0;
  _0xb5d1bb[10] = 2 / (_0x588e6c - _0x1e2a1b);
  _0xb5d1bb[11] = 0;
  _0xb5d1bb[12] = (_0x348911 + _0x51ccac) / (_0x348911 - _0x51ccac);
  _0xb5d1bb[13] = (_0x22fe4d + _0x17bedc) / (_0x22fe4d - _0x17bedc);
  _0xb5d1bb[14] = (_0x588e6c + _0x1e2a1b) / (_0x588e6c - _0x1e2a1b);
  _0xb5d1bb[15] = 1;
  return _0xb5d1bb;
};
Matrix.translate = function (
  _0x3ade93,
  _0x4c7765,
  _0x1516fb,
  _0x22ec70,
  _0x726d06,
) {
  _0x726d06 = _0x726d06 || new Float32Array(16);
  var _0x116849 = _0x3ade93[0];
  var _0x3c2493 = _0x3ade93[1];
  var _0x2693ce = _0x3ade93[2];
  var _0x381084 = _0x3ade93[3];
  var _0x3deb37 = _0x3ade93[4];
  var _0x4bf631 = _0x3ade93[5];
  var _0x2e44eb = _0x3ade93[6];
  var _0x57cc6f = _0x3ade93[7];
  var _0x3b3441 = _0x3ade93[8];
  var _0x59b46e = _0x3ade93[9];
  var _0x48e442 = _0x3ade93[10];
  var _0x4df96a = _0x3ade93[11];
  var _0x4c53f2 = _0x3ade93[12];
  var _0x40debc = _0x3ade93[13];
  var _0x192307 = _0x3ade93[14];
  var _0x5db26d = _0x3ade93[15];
  if (_0x3ade93 !== _0x726d06) {
    _0x726d06[0] = _0x116849;
    _0x726d06[1] = _0x3c2493;
    _0x726d06[2] = _0x2693ce;
    _0x726d06[3] = _0x381084;
    _0x726d06[4] = _0x3deb37;
    _0x726d06[5] = _0x4bf631;
    _0x726d06[6] = _0x2e44eb;
    _0x726d06[7] = _0x57cc6f;
    _0x726d06[8] = _0x3b3441;
    _0x726d06[9] = _0x59b46e;
    _0x726d06[10] = _0x48e442;
    _0x726d06[11] = _0x4df96a;
  }
  _0x726d06[12] =
    _0x116849 * _0x4c7765 +
    _0x3deb37 * _0x1516fb +
    _0x3b3441 * _0x22ec70 +
    _0x4c53f2;
  _0x726d06[13] =
    _0x3c2493 * _0x4c7765 +
    _0x4bf631 * _0x1516fb +
    _0x59b46e * _0x22ec70 +
    _0x40debc;
  _0x726d06[14] =
    _0x2693ce * _0x4c7765 +
    _0x2e44eb * _0x1516fb +
    _0x48e442 * _0x22ec70 +
    _0x192307;
  _0x726d06[15] =
    _0x381084 * _0x4c7765 +
    _0x57cc6f * _0x1516fb +
    _0x4df96a * _0x22ec70 +
    _0x5db26d;
  return _0x726d06;
};
Matrix.scale = function (
  _0x52b219,
  _0x27d9f4,
  _0x1a300d,
  _0x203b84,
  _0x42b9d0,
) {
  (_0x42b9d0 = _0x42b9d0 || new Float32Array(16))[0] =
    _0x27d9f4 * _0x52b219[0];
  _0x42b9d0[1] = _0x27d9f4 * _0x52b219[1];
  _0x42b9d0[2] = _0x27d9f4 * _0x52b219[2];
  _0x42b9d0[3] = _0x27d9f4 * _0x52b219[3];
  _0x42b9d0[4] = _0x1a300d * _0x52b219[4];
  _0x42b9d0[5] = _0x1a300d * _0x52b219[5];
  _0x42b9d0[6] = _0x1a300d * _0x52b219[6];
  _0x42b9d0[7] = _0x1a300d * _0x52b219[7];
  _0x42b9d0[8] = _0x203b84 * _0x52b219[8];
  _0x42b9d0[9] = _0x203b84 * _0x52b219[9];
  _0x42b9d0[10] = _0x203b84 * _0x52b219[10];
  _0x42b9d0[11] = _0x203b84 * _0x52b219[11];
  if (_0x52b219 !== _0x42b9d0) {
    _0x42b9d0[12] = _0x52b219[12];
    _0x42b9d0[13] = _0x52b219[13];
    _0x42b9d0[14] = _0x52b219[14];
    _0x42b9d0[15] = _0x52b219[15];
  }
  return _0x42b9d0;
};
Matrix.translation = function (
  _0x2b3d36,
  _0x2b04cd,
  _0x36cfd4,
  _0x5a8d97,
) {
  (_0x5a8d97 = _0x5a8d97 || new Float32Array(16))[0] = 1;
  _0x5a8d97[1] = 0;
  _0x5a8d97[2] = 0;
  _0x5a8d97[3] = 0;
  _0x5a8d97[4] = 0;
  _0x5a8d97[5] = 1;
  _0x5a8d97[6] = 0;
  _0x5a8d97[7] = 0;
  _0x5a8d97[8] = 0;
  _0x5a8d97[9] = 0;
  _0x5a8d97[10] = 1;
  _0x5a8d97[11] = 0;
  _0x5a8d97[12] = _0x2b3d36;
  _0x5a8d97[13] = _0x2b04cd;
  _0x5a8d97[14] = _0x36cfd4;
  _0x5a8d97[15] = 1;
  return _0x5a8d97;
};
(function (_0x31cf5d) {
  var _0x11d4c5;
  function _0x217e31() {
    var _0x23f8cc = ["monospace", "sans-serif", "serif"];
    var _0x34928a = document.getElementsByTagName("body")[0];
    var _0x25a026 = document.createElement("span");
    _0x25a026.style.fontSize = "72px";
    _0x25a026.innerHTML = "mmmwmmmmmmlli";
    var _0x563938 = {};
    var _0xbd1027 = {};
    for (var _0x18e9eb in _0x23f8cc) {
      _0x25a026.style.fontFamily = _0x23f8cc[_0x18e9eb];
      _0x34928a.appendChild(_0x25a026);
      _0x563938[_0x23f8cc[_0x18e9eb]] = _0x25a026.offsetWidth;
      _0xbd1027[_0x23f8cc[_0x18e9eb]] = _0x25a026.offsetHeight;
      _0x34928a.removeChild(_0x25a026);
    }
    this.detect = function (_0x1615b2) {
      var _0x44aff4 = false;
      for (var _0xf35fd2 in _0x23f8cc) {
        _0x25a026.style.fontFamily =
          _0x1615b2 + "," + _0x23f8cc[_0xf35fd2];
        _0x34928a.appendChild(_0x25a026);
        var _0x3922f9 =
          _0x25a026.offsetWidth != _0x563938[_0x23f8cc[_0xf35fd2]] ||
          _0x25a026.offsetHeight != _0xbd1027[_0x23f8cc[_0xf35fd2]];
        _0x34928a.removeChild(_0x25a026);
        _0x44aff4 = _0x44aff4 || _0x3922f9;
      }
      return _0x44aff4;
    };
  }
  function _0x14b432(_0xe50b43, _0x57554e) {
    var _0x2377c1;
    var _0x2373d7;
    var _0x5b9482;
    var _0x32f512;
    var _0x2b1bbf;
    var _0xb41b2e;
    _0x2377c1 = _0xe50b43.length & 3;
    _0x2373d7 = _0xe50b43.length - _0x2377c1;
    _0x5b9482 = _0x57554e;
    for (_0xb41b2e = 0; _0xb41b2e < _0x2373d7; ) {
      _0x2b1bbf =
        (_0xe50b43.charCodeAt(_0xb41b2e) & 255) |
        ((_0xe50b43.charCodeAt(++_0xb41b2e) & 255) << 8) |
        ((_0xe50b43.charCodeAt(++_0xb41b2e) & 255) << 16) |
        ((_0xe50b43.charCodeAt(++_0xb41b2e) & 255) << 24);
      ++_0xb41b2e;
      _0x5b9482 =
        27492 +
        ((_0x32f512 =
          (((_0x5b9482 =
            ((_0x5b9482 ^= _0x2b1bbf =
              (((_0x2b1bbf =
                ((_0x2b1bbf =
                  ((_0x2b1bbf & 65535) * 3432918353 +
                    ((((_0x2b1bbf >>> 16) * 3432918353) & 65535) <<
                      16)) &
                  4294967295) <<
                  15) |
                (_0x2b1bbf >>> 17)) &
                65535) *
                461845907 +
                ((((_0x2b1bbf >>> 16) * 461845907) & 65535) << 16)) &
              4294967295) <<
              13) |
            (_0x5b9482 >>> 19)) &
            65535) *
            5 +
            ((((_0x5b9482 >>> 16) * 5) & 65535) << 16)) &
          4294967295) &
          65535) +
        (((58964 + (_0x32f512 >>> 16)) & 65535) << 16);
    }
    _0x2b1bbf = 0;
    switch (_0x2377c1) {
      case 3:
        _0x2b1bbf ^=
          (_0xe50b43.charCodeAt(_0xb41b2e + 2) & 255) << 16;
      case 2:
        _0x2b1bbf ^= (_0xe50b43.charCodeAt(_0xb41b2e + 1) & 255) << 8;
      case 1:
        _0x5b9482 ^= _0x2b1bbf =
          (((_0x2b1bbf =
            ((_0x2b1bbf =
              (((_0x2b1bbf ^= _0xe50b43.charCodeAt(_0xb41b2e) & 255) &
                65535) *
                3432918353 +
                ((((_0x2b1bbf >>> 16) * 3432918353) & 65535) << 16)) &
              4294967295) <<
              15) |
            (_0x2b1bbf >>> 17)) &
            65535) *
            461845907 +
            ((((_0x2b1bbf >>> 16) * 461845907) & 65535) << 16)) &
          4294967295;
    }
    _0x5b9482 ^= _0xe50b43.length;
    _0x5b9482 =
      (((_0x5b9482 ^= _0x5b9482 >>> 16) & 65535) * 2246822507 +
        ((((_0x5b9482 >>> 16) * 2246822507) & 65535) << 16)) &
      4294967295;
    _0x5b9482 =
      (((_0x5b9482 ^= _0x5b9482 >>> 13) & 65535) * 3266489909 +
        ((((_0x5b9482 >>> 16) * 3266489909) & 65535) << 16)) &
      4294967295;
    return (_0x5b9482 ^= _0x5b9482 >>> 16) >>> 0;
  }
  function _0x454209() {
    _0x11d4c5 = new _0x217e31();
    return this;
  }
  _0x454209.prototype = {
    get: function () {
      var _0x21bc02 = this;
      function _0x25eaff(_0x4aed10, _0x2949c4) {
        try {
          var _0x2dc186 = _0x4aed10();
          return _0x2dc186 ?? (_0x2949c4 || "");
        } catch (_0xb652df) {
          return _0x2949c4 || "";
        }
      }
      var _0xc811cd = _0x25eaff(function () {
        return _0x21bc02.webgl2();
      }, "");
      var _0xd534c1 = _0x25eaff(function () {
        return _0x21bc02.gsp();
      }, "");
      var _0x15286b = _0x25eaff(function () {
        return _0x21bc02.gpl();
      }, "");
      var _0xcaf0e8 = _0x25eaff(function () {
        return _0x21bc02.gfo();
      }, "");
      var _0x4b2b2a = _0x25eaff(function () {
        return _0x21bc02.gtz();
      }, "");
      var _0x4b6812 = _0x25eaff(function () {
        return _0x21bc02.gla();
      }, "");
      var _0xe6101c = _0x25eaff(function () {
        return _0x21bc02.gsl();
      }, "");
      var _0x43ac18 = _0x25eaff(function () {
        return _0x21bc02.gcp();
      }, "");
      var _0x28436e =
        typeof navigator != "undefined" ? navigator : {};
      var _0xc39eba =
        _0x28436e.hardwareConcurrency != null
          ? String(_0x28436e.hardwareConcurrency)
          : "";
      var _0x30ef4b =
        _0x28436e.maxTouchPoints != null
          ? String(_0x28436e.maxTouchPoints)
          : "";
      var _0x5aad6d = _0x28436e.userAgent;
      var _0x52447c =
        _0x5aad6d && _0x5aad6d.length > 0
          ? _0x5aad6d.charAt(0).toLowerCase()
          : "";
      var _0x382227 =
        _0xc811cd +
        ":" +
        _0xd534c1 +
        ":" +
        _0x15286b +
        ":" +
        _0xcaf0e8 +
        ":" +
        sessionStorage +
        ":" +
        _0x4b2b2a +
        ":" +
        _0x4b6812 +
        ":" +
        _0xe6101c +
        ":" +
        _0x43ac18 +
        ":" +
        _0xc39eba +
        ":" +
        _0x30ef4b +
        ":" +
        _0x52447c;
      return String(_0x14b432(_0x382227, 256));
    },
    gsp: function () {
      return (
        "Cu: " +
        this.gcr() +
        ", Av: " +
        this.gar() +
        ", CD: " +
        this.gcd() +
        ", X: " +
        this.gXDPI() +
        ", Y: " +
        this.gYDPI()
      );
    },
    gcd: function () {
      return screen.colorDepth;
    },
    gcr: function () {
      return screen.width + "x" + screen.height;
    },
    gar: function () {
      return screen.availWidth + "x" + screen.availHeight;
    },
    gXDPI: function () {
      return screen.deviceXDPI;
    },
    gYDPI: function () {
      return screen.deviceYDPI;
    },
    gpl: function () {
      var _0x185008 = "";
      for (
        var _0x221500 = 0;
        _0x221500 < navigator.plugins.length;
        _0x221500++
      ) {
        if (_0x221500 == navigator.plugins.length - 1) {
          _0x185008 += navigator.plugins[_0x221500].name;
        } else {
          _0x185008 += navigator.plugins[_0x221500].name + ", ";
        }
      }
      return _0x185008;
    },
    gmty: function () {
      var _0x23e291 = "";
      if (navigator.mimeTypes) {
        for (
          var _0x560b38 = 0;
          _0x560b38 < navigator.mimeTypes.length;
          _0x560b38++
        ) {
          if (_0x560b38 == navigator.mimeTypes.length - 1) {
            _0x23e291 += navigator.mimeTypes[_0x560b38].description;
          } else {
            _0x23e291 +=
              navigator.mimeTypes[_0x560b38].description + ", ";
          }
        }
      }
      return _0x23e291;
    },
    gfo: function () {
      var _0x249f7e = [
        "Abadi MT Condensed Light",
        "Adobe Fangsong Std",
        "Adobe Hebrew",
        "Adobe Ming Std",
        "Agency FB",
        "Aharoni",
        "Andalus",
        "Angsana New",
        "AngsanaUPC",
        "Aparajita",
        "Arab",
        "Arabic Transparent",
        "Arabic Typesetting",
        "Arial Baltic",
        "Arial Black",
        "Arial CE",
        "Arial CYR",
        "Arial Greek",
        "Arial TUR",
        "Arial",
        "Batang",
        "BatangChe",
        "Bauhaus 93",
        "Bell MT",
        "Bitstream Vera Serif",
        "Bodoni MT",
        "Bookman Old Style",
        "Braggadocio",
        "Broadway",
        "Browallia New",
        "BrowalliaUPC",
        "Calibri Light",
        "Calibri",
        "Californian FB",
        "Cambria Math",
        "Cambria",
        "Candara",
        "Castellar",
        "Casual",
        "Centaur",
        "Century Gothic",
        "Chalkduster",
        "Colonna MT",
        "Comic Sans MS",
        "Consolas",
        "Constantia",
        "Copperplate Gothic Light",
        "Corbel",
        "Cordia New",
        "CordiaUPC",
        "Courier New Baltic",
        "Courier New CE",
        "Courier New CYR",
        "Courier New Greek",
        "Courier New TUR",
        "Courier New",
        "DFKai-SB",
        "DaunPenh",
        "David",
        "DejaVu LGC Sans Mono",
        "Desdemona",
        "DilleniaUPC",
        "DokChampa",
        "Dotum",
        "DotumChe",
        "Ebrima",
        "Engravers MT",
        "Eras Bold ITC",
        "Estrangelo Edessa",
        "EucrosiaUPC",
        "Euphemia",
        "Eurostile",
        "FangSong",
        "Forte",
        "FrankRuehl",
        "Franklin Gothic Heavy",
        "Franklin Gothic Medium",
        "FreesiaUPC",
        "French Script MT",
        "Gabriola",
        "Gautami",
        "Georgia",
        "Gigi",
        "Gisha",
        "Goudy Old Style",
        "Gulim",
        "GulimChe",
        "GungSeo",
        "Gungsuh",
        "GungsuhChe",
        "Haettenschweiler",
        "Harrington",
        "Hei S",
        "HeiT",
        "Heisei Kaku Gothic",
        "Hiragino Sans GB",
        "Impact",
        "Informal Roman",
        "IrisUPC",
        "Iskoola Pota",
        "JasmineUPC",
        "KacstOne",
        "KaiTi",
        "Kalinga",
        "Kartika",
        "Khmer UI",
        "Kino MT",
        "KodchiangUPC",
        "Kokila",
        "Kozuka Gothic Pr6N",
        "Lao UI",
        "Latha",
        "Leelawadee",
        "Levenim MT",
        "LilyUPC",
        "Lohit Gujarati",
        "Loma",
        "Lucida Bright",
        "Lucida Console",
        "Lucida Fax",
        "Lucida Sans Unicode",
        "MS Gothic",
        "MS Mincho",
        "MS PGothic",
        "MS PMincho",
        "MS Reference Sans Serif",
        "MS UI Gothic",
        "MV Boli",
        "Magneto",
        "Malgun Gothic",
        "Mangal",
        "Marlett",
        "Matura MT Script Capitals",
        "Meiryo UI",
        "Meiryo",
        "Menlo",
        "Microsoft Himalaya",
        "Microsoft JhengHei",
        "Microsoft New Tai Lue",
        "Microsoft PhagsPa",
        "Microsoft Sans Serif",
        "Microsoft Tai Le",
        "Microsoft Uighur",
        "Microsoft YaHei",
        "Microsoft Yi Baiti",
        "MingLiU",
        "MingLiU-ExtB",
        "MingLiU_HKSCS",
        "MingLiU_HKSCS-ExtB",
        "Miriam Fixed",
        "Miriam",
        "Mongolian Baiti",
        "MoolBoran",
        "NSimSun",
        "Narkisim",
        "News Gothic MT",
        "Niagara Solid",
        "Nyala",
        "PMingLiU",
        "PMingLiU-ExtB",
        "Palace Script MT",
        "Palatino Linotype",
        "Papyrus",
        "Perpetua",
        "Plantagenet Cherokee",
        "Playbill",
        "Prelude Bold",
        "Prelude Condensed Bold",
        "Prelude Condensed Medium",
        "Prelude Medium",
        "PreludeCompressedWGL Black",
        "PreludeCompressedWGL Bold",
        "PreludeCompressedWGL Light",
        "PreludeCompressedWGL Medium",
        "PreludeCondensedWGL Black",
        "PreludeCondensedWGL Bold",
        "PreludeCondensedWGL Light",
        "PreludeCondensedWGL Medium",
        "PreludeWGL Black",
        "PreludeWGL Bold",
        "PreludeWGL Light",
        "PreludeWGL Medium",
        "Raavi",
        "Rachana",
        "Rockwell",
        "Rod",
        "Sakkal Majalla",
        "Sawasdee",
        "Script MT Bold",
        "Segoe Print",
        "Segoe Script",
        "Segoe UI Light",
        "Segoe UI Semibold",
        "Segoe UI Symbol",
        "Segoe UI",
        "Shonar Bangla",
        "Showcard Gothic",
        "Shruti",
        "SimHei",
        "SimSun",
        "SimSun-ExtB",
        "Simplified Arabic Fixed",
        "Simplified Arabic",
        "Snap ITC",
        "Sylfaen",
        "Symbol",
        "Tahoma",
        "Times New Roman Baltic",
        "Times New Roman CE",
        "Times New Roman CYR",
        "Times New Roman Greek",
        "Times New Roman TUR",
        "Times New Roman",
        "TlwgMono",
        "Traditional Arabic",
        "Trebuchet MS",
        "Tunga",
        "Tw Cen MT Condensed Extra Bold",
        "Ubuntu",
        "Umpush",
        "Univers",
        "Utopia",
        "Utsaah",
        "Vani",
        "Verdana",
        "Vijaya",
        "Vladimir Script",
        "Vrinda",
        "Webdings",
        "Wide Latin",
        "Wingdings",
      ];
      var _0x3122d8 = "";
      for (
        var _0x5ab0c6 = 0;
        _0x5ab0c6 < _0x249f7e.length;
        _0x5ab0c6++
      ) {
        if (_0x11d4c5.detect(_0x249f7e[_0x5ab0c6])) {
          _0x3122d8 +=
            _0x5ab0c6 == _0x249f7e.length - 1
              ? _0x249f7e[_0x5ab0c6]
              : _0x249f7e[_0x5ab0c6] + ", ";
        }
      }
      return _0x3122d8;
    },
    gtz: function () {
      var _0x24adcb;
      var _0xee4e2a;
      _0x24adcb = new Date();
      if (
        (_0xee4e2a = String(-_0x24adcb.getTimezoneOffset() / 60)) < 0
      ) {
        return "-" + ("0" + (_0xee4e2a *= -1)).slice(-2);
      } else {
        return "+" + ("0" + _0xee4e2a).slice(-2);
      }
    },
    gla: function () {
      return navigator.language;
    },
    gsl: function () {
      return navigator.systemLanguage || window.navigator.language;
    },
    webgl: function () {
      var _0x56684a;
      var _0x319d63;
      (_0x56684a = document.createElement("canvas")).width = 256;
      _0x56684a.height = 128;
      if (
        !(_0x319d63 =
          _0x56684a.getContext("webgl2") ||
          _0x56684a.getContext("experimental-webgl2") ||
          _0x56684a.getContext("webgl") ||
          _0x56684a.getContext("experimental-webgl") ||
          _0x56684a.getContext("moz-webgl"))
      ) {
        return "0";
      }
      try {
        var _0x73217f = _0x319d63.createBuffer();
        _0x319d63.bindBuffer(_0x319d63.ARRAY_BUFFER, _0x73217f);
        var _0xd707e7 = new Float32Array([
          -0.2, -0.9, 0, 0.4, -0.26, 0, 0, 0.7321, 0,
        ]);
        _0x319d63.bufferData(
          _0x319d63.ARRAY_BUFFER,
          _0xd707e7,
          _0x319d63.STATIC_DRAW,
        );
        _0x73217f.itemSize = 3;
        _0x73217f.numItems = 3;
        var _0x10dca1 = _0x319d63.createProgram();
        var _0x50810d = _0x319d63.createShader(
          _0x319d63.VERTEX_SHADER,
        );
        _0x319d63.shaderSource(
          _0x50810d,
          "attribute vec2 attrVertex;varying vec2 varyinTexCoordinate;uniform vec2 uniformOffset;void main(){varyinTexCoordinate=attrVertex+uniformOffset;gl_Position=vec4(attrVertex,0,1);}",
        );
        _0x319d63.compileShader(_0x50810d);
        var _0x2e0573 = _0x319d63.createShader(
          _0x319d63.FRAGMENT_SHADER,
        );
        _0x319d63.shaderSource(
          _0x2e0573,
          "precision mediump float;varying vec2 varyinTexCoordinate;void main() {gl_FragColor=vec4(varyinTexCoordinate,0,1);}",
        );
        _0x319d63.compileShader(_0x2e0573);
        _0x319d63.attachShader(_0x10dca1, _0x50810d);
        _0x319d63.attachShader(_0x10dca1, _0x2e0573);
        _0x319d63.linkProgram(_0x10dca1);
        _0x319d63.useProgram(_0x10dca1);
        _0x10dca1.vertexPosAttrib = _0x319d63.getAttribLocation(
          _0x10dca1,
          "attrVertex",
        );
        _0x10dca1.offsetUniform = _0x319d63.getUniformLocation(
          _0x10dca1,
          "uniformOffset",
        );
        _0x319d63.enableVertexAttribArray(_0x10dca1.vertexPosArray);
        _0x319d63.vertexAttribPointer(
          _0x10dca1.vertexPosAttrib,
          _0x73217f.itemSize,
          _0x319d63.FLOAT,
          false,
          0,
          0,
        );
        _0x319d63.uniform2f(_0x10dca1.offsetUniform, 1, 1);
        _0x319d63.drawArrays(
          _0x319d63.TRIANGLE_STRIP,
          0,
          _0x73217f.numItems,
        );
      } catch (_0x941b7) {
        return "0";
      }
      try {
        var _0x22f016 = new Uint8Array(131072);
        _0x319d63.readPixels(
          0,
          0,
          256,
          128,
          _0x319d63.RGBA,
          _0x319d63.UNSIGNED_BYTE,
          _0x22f016,
        );
        return _0x14b432(
          JSON.stringify(_0x22f016).replace(/,?"[0-9]+":/g, ""),
          256,
        );
      } catch (_0x9e0033) {
        return "0";
      }
    },
    webgl2: function () {
      let _0x3d8c2f = "";
      let _0x4f7f01 = "";
      let _0x4753fc = "";
      try {
        function _0x2ede9e(_0x67c18a) {
          _0x57d1b0.clearColor(0, 0, 0, 1);
          _0x57d1b0.enable(_0x57d1b0.DEPTH_TEST);
          _0x57d1b0.depthFunc(_0x57d1b0.LEQUAL);
          _0x57d1b0.clear(
            _0x57d1b0.COLOR_BUFFER_BIT | _0x57d1b0.DEPTH_BUFFER_BIT,
          );
          return "[" + _0x67c18a[0] + ", " + _0x67c18a[1] + "]";
        }
        var _0x2a294a = document.createElement("canvas");
        var _0x57d1b0 =
          _0x2a294a.getContext("webgl") ||
          _0x2a294a.getContext("experimental-webgl");
        var _0x26cf6b = [];
        var _0x34958a = _0x57d1b0.createBuffer();
        _0x57d1b0.bindBuffer(_0x57d1b0.ARRAY_BUFFER, _0x34958a);
        var _0x418e13 = new Float32Array([
          -0.2, -0.9, 0, 0.4, -0.26, 0, 0, 0.732134444, 0,
        ]);
        _0x57d1b0.bufferData(
          _0x57d1b0.ARRAY_BUFFER,
          _0x418e13,
          _0x57d1b0.STATIC_DRAW,
        );
        _0x34958a.itemSize = 3;
        _0x34958a.numItems = 3;
        var _0x38149b = _0x57d1b0.createProgram();
        var _0x2375db = _0x57d1b0.createShader(
          _0x57d1b0.VERTEX_SHADER,
        );
        _0x57d1b0.shaderSource(
          _0x2375db,
          "attribute vec2 attrVertex;varying vec2 varyinTexCoordinate;uniform vec2 uniformOffset;void main(){varyinTexCoordinate=attrVertex+uniformOffset;gl_Position=vec4(attrVertex,0,1);}",
        );
        _0x57d1b0.compileShader(_0x2375db);
        var _0xac1f64 = _0x57d1b0.createShader(
          _0x57d1b0.FRAGMENT_SHADER,
        );
        _0x57d1b0.shaderSource(
          _0xac1f64,
          "precision mediump float;varying vec2 varyinTexCoordinate;void main() {gl_FragColor=vec4(varyinTexCoordinate,0,1);}",
        );
        _0x57d1b0.compileShader(_0xac1f64);
        _0x57d1b0.attachShader(_0x38149b, _0x2375db);
        _0x57d1b0.attachShader(_0x38149b, _0xac1f64);
        _0x57d1b0.linkProgram(_0x38149b);
        _0x57d1b0.useProgram(_0x38149b);
        _0x38149b.vertexPosAttrib = _0x57d1b0.getAttribLocation(
          _0x38149b,
          "attrVertex",
        );
        _0x38149b.offsetUniform = _0x57d1b0.getUniformLocation(
          _0x38149b,
          "uniformOffset",
        );
        _0x57d1b0.enableVertexAttribArray(_0x38149b.vertexPosArray);
        _0x57d1b0.vertexAttribPointer(
          _0x38149b.vertexPosAttrib,
          _0x34958a.itemSize,
          _0x57d1b0.FLOAT,
          false,
          0,
          0,
        );
        _0x57d1b0.uniform2f(_0x38149b.offsetUniform, 1, 1);
        _0x57d1b0.drawArrays(
          _0x57d1b0.TRIANGLE_STRIP,
          0,
          _0x34958a.numItems,
        );
        if (_0x57d1b0.canvas != null) {
          _0x26cf6b.push(_0x57d1b0.canvas.toDataURL());
        }
        _0x26cf6b.push(
          "ext:" + _0x57d1b0.getSupportedExtensions().join(";"),
        );
        _0x26cf6b.push(
          "a:" +
            _0x2ede9e(
              _0x57d1b0.getParameter(
                _0x57d1b0.ALIASED_LINE_WIDTH_RANGE,
              ),
            ),
        );
        _0x26cf6b.push(
          "b:" +
            _0x2ede9e(
              _0x57d1b0.getParameter(
                _0x57d1b0.ALIASED_POINT_SIZE_RANGE,
              ),
            ),
        );
        _0x26cf6b.push(
          "c:" + _0x57d1b0.getParameter(_0x57d1b0.ALPHA_BITS),
        );
        _0x26cf6b.push(
          "d:" +
            (_0x57d1b0.getContextAttributes().antialias
              ? "yes"
              : "no"),
        );
        _0x26cf6b.push(
          "e:" + _0x57d1b0.getParameter(_0x57d1b0.BLUE_BITS),
        );
        _0x26cf6b.push(
          "f:" + _0x57d1b0.getParameter(_0x57d1b0.DEPTH_BITS),
        );
        _0x26cf6b.push(
          "g:" + _0x57d1b0.getParameter(_0x57d1b0.GREEN_BITS),
        );
        _0x26cf6b.push(
          "h:" +
            (function (_0x1273e5) {
              var _0x370c2c;
              var _0x221edd =
                _0x1273e5.getExtension(
                  "EXT_texture_filter_anisotropic",
                ) ||
                _0x1273e5.getExtension(
                  "WEBKIT_EXT_texture_filter_anisotropic",
                ) ||
                _0x1273e5.getExtension(
                  "MOZ_EXT_texture_filter_anisotropic",
                );
              if (_0x221edd) {
                if (
                  (_0x370c2c = _0x1273e5.getParameter(
                    _0x221edd.MAX_TEXTURE_MAX_ANISOTROPY_EXT,
                  )) === 0
                ) {
                  _0x370c2c = 2;
                }
                return _0x370c2c;
              } else {
                return null;
              }
            })(_0x57d1b0),
        );
        _0x26cf6b.push(
          "i:" +
            _0x57d1b0.getParameter(
              _0x57d1b0.MAX_COMBINED_TEXTURE_IMAGE_UNITS,
            ),
        );
        _0x26cf6b.push(
          "j:" +
            _0x57d1b0.getParameter(
              _0x57d1b0.MAX_CUBE_MAP_TEXTURE_SIZE,
            ),
        );
        _0x26cf6b.push(
          "k:" +
            _0x57d1b0.getParameter(
              _0x57d1b0.MAX_FRAGMENT_UNIFORM_VECTORS,
            ),
        );
        _0x26cf6b.push(
          "l:" +
            _0x57d1b0.getParameter(_0x57d1b0.MAX_RENDERBUFFER_SIZE),
        );
        _0x26cf6b.push(
          "m:" +
            _0x57d1b0.getParameter(_0x57d1b0.MAX_TEXTURE_IMAGE_UNITS),
        );
        _0x26cf6b.push(
          "n:" + _0x57d1b0.getParameter(_0x57d1b0.MAX_TEXTURE_SIZE),
        );
        _0x26cf6b.push(
          "o:" +
            _0x57d1b0.getParameter(_0x57d1b0.MAX_VARYING_VECTORS),
        );
        _0x26cf6b.push(
          "p:" + _0x57d1b0.getParameter(_0x57d1b0.MAX_VERTEX_ATTRIBS),
        );
        _0x26cf6b.push(
          "q:" +
            _0x57d1b0.getParameter(
              _0x57d1b0.MAX_VERTEX_TEXTURE_IMAGE_UNITS,
            ),
        );
        _0x26cf6b.push(
          "r:" +
            _0x57d1b0.getParameter(
              _0x57d1b0.MAX_VERTEX_UNIFORM_VECTORS,
            ),
        );
        _0x26cf6b.push(
          "s:" +
            _0x2ede9e(
              _0x57d1b0.getParameter(_0x57d1b0.MAX_VIEWPORT_DIMS),
            ),
        );
        _0x26cf6b.push(
          "t:" + _0x57d1b0.getParameter(_0x57d1b0.RED_BITS),
        );
        _0x26cf6b.push(
          "u:" + _0x57d1b0.getParameter(_0x57d1b0.RENDERER),
        );
        _0x26cf6b.push(
          "v:" +
            _0x57d1b0.getParameter(
              _0x57d1b0.SHADING_LANGUAGE_VERSION,
            ),
        );
        _0x26cf6b.push(
          "w:" + _0x57d1b0.getParameter(_0x57d1b0.STENCIL_BITS),
        );
        _0x26cf6b.push(
          "x:" + _0x57d1b0.getParameter(_0x57d1b0.VENDOR),
        );
        _0x26cf6b.push(
          "y:" + _0x57d1b0.getParameter(_0x57d1b0.VERSION),
        );
        _0x26cf6b.push(
          "z:" +
            _0x57d1b0.getShaderPrecisionFormat(
              _0x57d1b0.VERTEX_SHADER,
              _0x57d1b0.HIGH_FLOAT,
            ).precision,
        );
        _0x26cf6b.push(
          "aa:" +
            _0x57d1b0.getShaderPrecisionFormat(
              _0x57d1b0.VERTEX_SHADER,
              _0x57d1b0.HIGH_FLOAT,
            ).rangeMin,
        );
        _0x26cf6b.push(
          "bb:" +
            _0x57d1b0.getShaderPrecisionFormat(
              _0x57d1b0.VERTEX_SHADER,
              _0x57d1b0.HIGH_FLOAT,
            ).rangeMax,
        );
        _0x26cf6b.push(
          "cc:" +
            _0x57d1b0.getShaderPrecisionFormat(
              _0x57d1b0.VERTEX_SHADER,
              _0x57d1b0.MEDIUM_FLOAT,
            ).precision,
        );
        _0x26cf6b.push(
          "dd:" +
            _0x57d1b0.getShaderPrecisionFormat(
              _0x57d1b0.VERTEX_SHADER,
              _0x57d1b0.MEDIUM_FLOAT,
            ).rangeMin,
        );
        _0x26cf6b.push(
          "ee:" +
            _0x57d1b0.getShaderPrecisionFormat(
              _0x57d1b0.VERTEX_SHADER,
              _0x57d1b0.MEDIUM_FLOAT,
            ).rangeMax,
        );
        _0x26cf6b.push(
          "ff:" +
            _0x57d1b0.getShaderPrecisionFormat(
              _0x57d1b0.VERTEX_SHADER,
              _0x57d1b0.LOW_FLOAT,
            ).precision,
        );
        _0x26cf6b.push(
          "gg:" +
            _0x57d1b0.getShaderPrecisionFormat(
              _0x57d1b0.VERTEX_SHADER,
              _0x57d1b0.LOW_FLOAT,
            ).rangeMin,
        );
        _0x26cf6b.push(
          "hh:" +
            _0x57d1b0.getShaderPrecisionFormat(
              _0x57d1b0.VERTEX_SHADER,
              _0x57d1b0.LOW_FLOAT,
            ).rangeMax,
        );
        _0x26cf6b.push(
          "ii:" +
            _0x57d1b0.getShaderPrecisionFormat(
              _0x57d1b0.FRAGMENT_SHADER,
              _0x57d1b0.HIGH_FLOAT,
            ).precision,
        );
        _0x26cf6b.push(
          "jj:" +
            _0x57d1b0.getShaderPrecisionFormat(
              _0x57d1b0.FRAGMENT_SHADER,
              _0x57d1b0.HIGH_FLOAT,
            ).rangeMin,
        );
        _0x26cf6b.push(
          "kk:" +
            _0x57d1b0.getShaderPrecisionFormat(
              _0x57d1b0.FRAGMENT_SHADER,
              _0x57d1b0.HIGH_FLOAT,
            ).rangeMax,
        );
        _0x26cf6b.push(
          "ll:" +
            _0x57d1b0.getShaderPrecisionFormat(
              _0x57d1b0.FRAGMENT_SHADER,
              _0x57d1b0.MEDIUM_FLOAT,
            ).precision,
        );
        _0x26cf6b.push(
          "mm:" +
            _0x57d1b0.getShaderPrecisionFormat(
              _0x57d1b0.FRAGMENT_SHADER,
              _0x57d1b0.MEDIUM_FLOAT,
            ).rangeMin,
        );
        _0x26cf6b.push(
          "nn:" +
            _0x57d1b0.getShaderPrecisionFormat(
              _0x57d1b0.FRAGMENT_SHADER,
              _0x57d1b0.MEDIUM_FLOAT,
            ).rangeMax,
        );
        _0x26cf6b.push(
          "oo:" +
            _0x57d1b0.getShaderPrecisionFormat(
              _0x57d1b0.FRAGMENT_SHADER,
              _0x57d1b0.LOW_FLOAT,
            ).precision,
        );
        _0x26cf6b.push(
          "pp:" +
            _0x57d1b0.getShaderPrecisionFormat(
              _0x57d1b0.FRAGMENT_SHADER,
              _0x57d1b0.LOW_FLOAT,
            ).rangeMin,
        );
        _0x26cf6b.push(
          "qq:" +
            _0x57d1b0.getShaderPrecisionFormat(
              _0x57d1b0.FRAGMENT_SHADER,
              _0x57d1b0.LOW_FLOAT,
            ).rangeMax,
        );
        _0x26cf6b.push(
          "rr:" +
            _0x57d1b0.getShaderPrecisionFormat(
              _0x57d1b0.VERTEX_SHADER,
              _0x57d1b0.HIGH_INT,
            ).precision,
        );
        _0x26cf6b.push(
          "ss:" +
            _0x57d1b0.getShaderPrecisionFormat(
              _0x57d1b0.VERTEX_SHADER,
              _0x57d1b0.HIGH_INT,
            ).rangeMin,
        );
        _0x26cf6b.push(
          "tt:" +
            _0x57d1b0.getShaderPrecisionFormat(
              _0x57d1b0.VERTEX_SHADER,
              _0x57d1b0.HIGH_INT,
            ).rangeMax,
        );
        _0x26cf6b.push(
          "uu:" +
            _0x57d1b0.getShaderPrecisionFormat(
              _0x57d1b0.VERTEX_SHADER,
              _0x57d1b0.MEDIUM_INT,
            ).precision,
        );
        _0x26cf6b.push(
          "vv:" +
            _0x57d1b0.getShaderPrecisionFormat(
              _0x57d1b0.VERTEX_SHADER,
              _0x57d1b0.MEDIUM_INT,
            ).rangeMin,
        );
        _0x26cf6b.push(
          "ww:" +
            _0x57d1b0.getShaderPrecisionFormat(
              _0x57d1b0.VERTEX_SHADER,
              _0x57d1b0.MEDIUM_INT,
            ).rangeMax,
        );
        _0x26cf6b.push(
          "xx:" +
            _0x57d1b0.getShaderPrecisionFormat(
              _0x57d1b0.VERTEX_SHADER,
              _0x57d1b0.LOW_INT,
            ).precision,
        );
        _0x26cf6b.push(
          "yy:" +
            _0x57d1b0.getShaderPrecisionFormat(
              _0x57d1b0.VERTEX_SHADER,
              _0x57d1b0.LOW_INT,
            ).rangeMin,
        );
        _0x26cf6b.push(
          "zz:" +
            _0x57d1b0.getShaderPrecisionFormat(
              _0x57d1b0.VERTEX_SHADER,
              _0x57d1b0.LOW_INT,
            ).rangeMax,
        );
        _0x26cf6b.push(
          "1:" +
            _0x57d1b0.getShaderPrecisionFormat(
              _0x57d1b0.FRAGMENT_SHADER,
              _0x57d1b0.HIGH_INT,
            ).precision,
        );
        _0x26cf6b.push(
          "2:" +
            _0x57d1b0.getShaderPrecisionFormat(
              _0x57d1b0.FRAGMENT_SHADER,
              _0x57d1b0.HIGH_INT,
            ).rangeMin,
        );
        _0x26cf6b.push(
          "3:" +
            _0x57d1b0.getShaderPrecisionFormat(
              _0x57d1b0.FRAGMENT_SHADER,
              _0x57d1b0.HIGH_INT,
            ).rangeMax,
        );
        _0x26cf6b.push(
          "4:" +
            _0x57d1b0.getShaderPrecisionFormat(
              _0x57d1b0.FRAGMENT_SHADER,
              _0x57d1b0.MEDIUM_INT,
            ).precision,
        );
        _0x26cf6b.push(
          "5:" +
            _0x57d1b0.getShaderPrecisionFormat(
              _0x57d1b0.FRAGMENT_SHADER,
              _0x57d1b0.MEDIUM_INT,
            ).rangeMin,
        );
        _0x26cf6b.push(
          "6:" +
            _0x57d1b0.getShaderPrecisionFormat(
              _0x57d1b0.FRAGMENT_SHADER,
              _0x57d1b0.MEDIUM_INT,
            ).rangeMax,
        );
        _0x26cf6b.push(
          "7:" +
            _0x57d1b0.getShaderPrecisionFormat(
              _0x57d1b0.FRAGMENT_SHADER,
              _0x57d1b0.LOW_INT,
            ).precision,
        );
        _0x26cf6b.push(
          "8:" +
            _0x57d1b0.getShaderPrecisionFormat(
              _0x57d1b0.FRAGMENT_SHADER,
              _0x57d1b0.LOW_INT,
            ).rangeMin,
        );
        _0x26cf6b.push(
          "9:" +
            _0x57d1b0.getShaderPrecisionFormat(
              _0x57d1b0.FRAGMENT_SHADER,
              _0x57d1b0.LOW_INT,
            ).rangeMax,
        );
        _0x3d8c2f = _0x26cf6b.join("§");
        var _0x2d35fb =
          (_0x2a294a = document.createElement("canvas")).getContext(
            "webgl",
          ) || _0x2a294a.getContext("experimental-webgl");
        if (
          _0x2d35fb
            .getSupportedExtensions()
            .indexOf("WEBGL_debug_renderer_info") >= 0
        ) {
          _0x4f7f01 = _0x2d35fb.getParameter(
            _0x2d35fb.getExtension("WEBGL_debug_renderer_info")
              .UNMASKED_VENDOR_WEBGL,
          );
          _0x4753fc = _0x2d35fb.getParameter(
            _0x2d35fb.getExtension("WEBGL_debug_renderer_info")
              .UNMASKED_RENDERER_WEBGL,
          );
        } else {
          _0x4f7f01 = "NA";
          _0x4753fc = "NA";
        }
      } catch (_0x4574c9) {
        _0x3d8c2f = "NA";
        _0x4f7f01 = "NA";
        _0x4753fc = "NA";
      }
      return _0x3d8c2f + "," + _0x4f7f01 + "," + _0x4753fc;
    },
    gcp: function () {
      var _0x39089b;
      var _0x29cc66 = document.createElement("canvas");
      try {
        _0x39089b = _0x29cc66.getContext("2d");
      } catch (_0x3522a0) {
        return "";
      }
      _0x39089b.textBaseline = "top";
      _0x39089b.font = "14px 'Arial'";
      _0x39089b.textBaseline = "alphabetic";
      _0x39089b.fillStyle = "#f60";
      _0x39089b.fillRect(125, 1, 62, 20);
      _0x39089b.fillStyle = "#069";
      _0x39089b.fillText("Jstris,mx <canvas> v0.39.0-X", 2, 15);
      _0x39089b.fillStyle = "rgba(102, 204, 0, 0.7)";
      _0x39089b.fillText("Jstris,mx <canvas> v0.39.0-X", 4, 17);
      return _0x29cc66.toDataURL();
    },
  };
  _0x31cf5d._jstrisx = _0x454209;
})(window);
EmoteSelect.prototype.init = async function () {
  this.emoteElem = document.createElement("div");
  this.emoteElem.classList.add("emotePicker");
  this.container.appendChild(this.emoteElem);
  this.comment = document.createComment(
    "Designed and developed by Erickmack",
  );
  this.emoteElem.appendChild(this.comment);
  this.initializeContainers();
  this.emoteList =
    typeof this.emoteIndex == "string"
      ? await fetch(this.emoteIndex).then((_0x1d3fb4) =>
          _0x1d3fb4.json(),
        )
      : this.emoteIndex;
  this.initializeEmotes();
  this.lastUsed();
  this.openButtonLogic();
};
EmoteSelect.prototype.initializeContainers = function () {
  this.searchElem = document.createElement("form");
  this.searchElem.classList.add("form-inline", "emoteForm");
  this.emoteElem.appendChild(this.searchElem);
  this.searchBar = document.createElement("input");
  this.searchBar.setAttribute("autocomplete", "off");
  this.searchBar.classList.add("form-control");
  this.searchBar.id = "emoteSearch";
  this.searchBar.addEventListener("input", () => {
    this.searchFunction(this.emoteList);
  });
  this.searchElem.addEventListener("submit", (_0x1b4ff5) => {
    _0x1b4ff5.preventDefault();
  });
  this.searchBar.setAttribute("type", "text");
  this.searchBar.setAttribute("placeholder", "Search Emotes");
  this.searchElem.appendChild(this.searchBar);
  this.optionsContainer = document.createElement("div");
  this.optionsContainer.classList.add("optionsContainer");
  this.emoteElem.appendChild(this.optionsContainer);
  this.emotesWrapper = document.createElement("div");
  this.emotesWrapper.classList.add("emotesWrapper");
  this.optionsContainer.appendChild(this.emotesWrapper);
};
EmoteSelect.prototype.initializeEmotes = function () {
  let _0x4ee8c2 = [];
  this.emoteList.forEach((_0x2303a5) => {
    if (
      _0x4ee8c2.findIndex((_0x5ab0d9) => _0x5ab0d9 === _0x2303a5.g) <=
      -1
    ) {
      _0x4ee8c2.push(_0x2303a5.g);
    }
  });
  this.groupList = _0x4ee8c2;
  this.createGroups(this.groupList);
  this.donateInfo(this.groupList);
};
EmoteSelect.prototype.createGroups = async function (_0x3817ba) {
  let _0x46c1f4 = this;
  this.emojis = this.emoteList;
  let _0x1fc7b5 = {
    root: document.querySelector(".emotesWrapper"),
    rootMargin: "10px",
    threshold: 0,
  };
  let _0x378485 = new IntersectionObserver(function (
    _0x362634,
    _0x206cbc,
  ) {
    setTimeout(() => {
      _0x362634.forEach((_0xa9b809) => {
        if (_0xa9b809.isIntersecting) {
          _0x46c1f4.createImages(_0x46c1f4.emojis, _0xa9b809.target);
          _0x206cbc.unobserve(_0xa9b809.target);
        }
      });
    }, 200);
  }, _0x1fc7b5);
  this.groupsFragment = document.createDocumentFragment();
  _0x3817ba.forEach((_0x401705) => {
    let _0x515502 = this.emojis.filter(
      (_0x5d870f) => _0x5d870f.g === "" + _0x401705,
    );
    _0x46c1f4.groupDiv = document.createElement("div");
    _0x46c1f4.groupDiv.classList.add("emotesGroup");
    _0x46c1f4.groupDiv.id = "" + _0x401705;
    _0x46c1f4.groupDiv.setAttribute("data-groupName", "" + _0x401705);
    _0x378485.observe(_0x46c1f4.groupDiv);
    _0x46c1f4.groupName = document.createElement("h3");
    _0x46c1f4.groupName.id = "" + _0x401705;
    _0x46c1f4.groupName.classList.add("groupName");
    _0x46c1f4.groupName.innerText = "" + _0x401705.toUpperCase();
    _0x46c1f4.groupDiv.appendChild(_0x46c1f4.groupName);
    let _0x1e80e8 = Math.ceil(_0x515502.length / 6) * 45 + 35.4;
    _0x46c1f4.groupDiv.style.minHeight = _0x1e80e8 + "px";
    _0x46c1f4.groupsFragment.appendChild(_0x46c1f4.groupDiv);
  });
  this.emotesWrapper.appendChild(this.groupsFragment);
  this.selectGroup();
};
EmoteSelect.prototype.donateInfo = function (_0x693f5c) {
  if (!(_0x693f5c.length > 2)) {
    this.donateLink = document.createElement("a");
    this.donateLink.classList.add("mSkInf");
    this.donateLink.id = "mSkInf-s";
    this.donateLink.setAttribute("href", "/donate");
    this.icon = document.createElement("i");
    this.icon.classList.add("glyphicon", "glyphicon-info-sign");
    this.span = document.createElement("span");
    this.span.innerText =
      "2k+ more emotes available to Jstris Supporters for $5";
    this.donateLink.appendChild(this.icon);
    this.donateLink.appendChild(this.span);
    this.donateLink.style.fontSize = "clamp(1.5rem,1vw,3rem)";
    this.emotesWrapper.appendChild(this.donateLink);
  }
};
EmoteSelect.prototype.getEmoteSource = function (_0x3edaa4) {
  let _0x15ad6c = null;
  if (_0x3edaa4.p) {
    _0x15ad6c = _0x3edaa4.p;
  } else if (_0x3edaa4.u) {
    _0x15ad6c = _0x3edaa4.u;
    if (
      !!_0x15ad6c &&
      !_0x15ad6c.startsWith("http") &&
      !_0x15ad6c.startsWith("/")
    ) {
      _0x15ad6c = "/" + _0x15ad6c;
    }
  } else {
    _0x15ad6c = "" + this.path + _0x3edaa4.n + ".svg";
  }
  return _0x15ad6c;
};
EmoteSelect.prototype.createImages = async function (
  _0x2bc75e,
  _0x1898ae,
) {
  let _0x3dd387 = this;
  let _0x2cfb41 = {
    root: document.getElementById("searchResults"),
    rootMargin: "10px",
    threshold: 0,
  };
  let _0x3d60b6 = new IntersectionObserver(function (
    _0x5d54d4,
    _0x150c79,
  ) {
    _0x3dd387.setSource(_0x5d54d4, _0x150c79);
  }, _0x2cfb41);
  this.emotesFragment = document.createDocumentFragment();
  let _0x11b357 = _0x1898ae.getAttribute("data-groupName");
  let _0xa3cc7d = _0x2bc75e.filter(
    (_0x414dce) => _0x414dce.g === "" + _0x11b357,
  );
  for (let _0x32b042 = 0; _0x32b042 < _0xa3cc7d.length; _0x32b042++) {
    _0x3dd387.emoteImg = document.createElement("img");
    let _0x436019 = this.getEmoteSource(_0xa3cc7d[_0x32b042]);
    _0x3dd387.emoteImg.classList.add("emoteImg", "loadingEmote");
    if (_0xa3cc7d[_0x32b042].u) {
      _0x3dd387.emoteImg.classList.add("jstrisEmote");
    }
    _0x3dd387.emoteImg.onload = function (_0x163477) {
      _0x163477.target.classList.remove("loadingEmote");
    };
    _0x3d60b6.observe(_0x3dd387.emoteImg);
    _0x3dd387.emoteImg.setAttribute(
      "data-emoteName",
      "" + _0xa3cc7d[_0x32b042].n,
    );
    _0x3dd387.emoteImg.setAttribute("data-source", _0x436019);
    _0x3dd387.emoteImg.addEventListener("click", (_0xd8d4e4) => {
      this.chatEmote(_0xd8d4e4.target);
      this.setStoredEmotes(_0xd8d4e4.target);
      if (!_0xd8d4e4.shiftKey) {
        this.hideElem();
      }
    });
    _0x3dd387.emoteImg.addEventListener("mouseover", (_0x2d3d17) => {
      this.showName(_0x2d3d17.target);
    });
    _0x3dd387.emotesFragment.appendChild(_0x3dd387.emoteImg);
  }
  _0x1898ae.appendChild(this.emotesFragment);
};
EmoteSelect.prototype.selectGroup = function () {
  this.selectionDiv = document.createElement("div");
  this.selectionDiv.id = "selectionDiv";
  this.groupList.forEach((_0x45a1e0) => {
    this.groupImage = document.createElement("img");
    this.groupImage.classList.add("groupLink");
    this.groupImage.setAttribute("data-groupName", "" + _0x45a1e0);
    this.groupImage.addEventListener("click", (_0x1d01eb) => {
      let _0x14d63e = _0x1d01eb.target.getAttribute("data-groupname");
      let _0x344e72 = document.getElementById(_0x14d63e);
      let _0x1bec54 = this.searchElem.clientHeight;
      let _0x516fb4 = _0x344e72.offsetTop - _0x1bec54;
      this.emotesWrapper.scrollTop = _0x516fb4;
    });
    this.groupImage.setAttribute("title", "" + _0x45a1e0);
    this.groupImage.setAttribute("data-toggle", "tooltip");
    this.groupImage.setAttribute("data-placement", "right");
    let _0x6bb8d4 = this.emoteList.filter(
      (_0x2d20e3) => _0x2d20e3.n === this.groupEmotes[_0x45a1e0],
    );
    if (_0x6bb8d4.length <= 0) {
      this.groupImage.setAttribute(
        "src",
        "" + this.groupEmotes[_0x45a1e0],
      );
      this.groupImage.classList.add("jstrisSelector");
    } else if (!_0x6bb8d4.u) {
      this.groupImage.setAttribute(
        "src",
        "" + this.path + this.groupEmotes[_0x45a1e0] + ".svg",
      );
    }
    this.selectionDiv.appendChild(this.groupImage);
  });
  this.optionsContainer.appendChild(this.selectionDiv);
  $('[data-toggle="tooltip"]').tooltip();
};
EmoteSelect.prototype.showName = function (_0x30326f) {
  let _0x2f5667 = _0x30326f.getAttribute("data-emoteName");
  document
    .getElementById("emoteSearch")
    .setAttribute("placeholder", ":" + _0x2f5667 + ":");
};
EmoteSelect.prototype.searchFunction = function (_0x1ea0aa) {
  let _0x1562c8 = this;
  let _0x426f76 = document.getElementById("emoteSearch").value;
  let _0x321277 = document.getElementById("searchResults");
  if (!_0x426f76 && _0x321277 != null) {
    _0x321277.parentNode.removeChild(_0x321277);
  }
  let _0x3d216f = new Fuse(_0x1ea0aa, {
    threshold: 0.3,
    keys: [
      {
        name: "n",
        weight: 2,
      },
      {
        name: "t",
        weight: 1,
      },
    ],
  }).search(_0x426f76);
  if (_0x321277) {
    if (_0x321277) {
      _0x321277.innerHTML = "";
    }
  } else {
    this.searchResults = document.createElement("div");
    this.searchResults.id = "searchResults";
    document
      .getElementsByClassName("emotePicker")[0]
      .appendChild(this.searchResults);
    _0x321277 = document.getElementById("searchResults");
  }
  let _0x172123 = {
    root: document.getElementById("searchResults"),
    rootMargin: "10px",
    threshold: 0,
  };
  let _0x2086af = new IntersectionObserver(function (
    _0x1016a3,
    _0x117f25,
  ) {
    _0x1562c8.setSource(_0x1016a3, _0x117f25);
  }, _0x172123);
  _0x1562c8.resultsFragment = document.createDocumentFragment();
  for (let _0x829db = 0; _0x829db < _0x3d216f.length; _0x829db++) {
    let _0x61b557 = _0x3d216f[_0x829db].item;
    let _0x5d6562 = this.getEmoteSource(_0x61b557);
    _0x1562c8.emoteResult = document.createElement("img");
    _0x1562c8.emoteResult.classList.add(
      "emoteImg",
      "loadingEmote",
      "resultImg",
    );
    _0x1562c8.emoteResult.setAttribute("data-source", _0x5d6562);
    _0x1562c8.emoteResult.onload = function (_0x54f9f1) {
      _0x54f9f1.target.classList.remove("loadingEmote");
    };
    _0x1562c8.emoteResult.setAttribute("title", _0x61b557.n);
    _0x1562c8.emoteResult.setAttribute("data-emoteName", _0x61b557.n);
    _0x1562c8.emoteResult.addEventListener("click", (_0x489a78) => {
      this.chatEmote(_0x489a78.target);
      this.setStoredEmotes(_0x489a78.target);
      if (!_0x489a78.shiftKey) {
        this.hideElem();
      }
    });
    _0x2086af.observe(this.emoteResult);
    _0x1562c8.resultsFragment.appendChild(this.emoteResult);
  }
  _0x321277.appendChild(this.resultsFragment);
};
EmoteSelect.prototype.setSource = function (_0x3f4d19, _0x11acca) {
  setTimeout(() => {
    _0x3f4d19.forEach((_0x33ebba) => {
      if (_0x33ebba.isIntersecting) {
        var _0x12a036 = _0x33ebba.target.getAttribute("data-source");
        _0x33ebba.target.setAttribute("src", _0x12a036);
        _0x11acca.unobserve(_0x33ebba.target);
      }
    });
  }, 400);
};
EmoteSelect.prototype.chatEmote = function (_0x2ba26b) {
  let _0x4c0783 = _0x2ba26b.getAttribute("data-emoteName");
  let _0xbb6dbe = this.input.value;
  let _0x44ccac = this.getCaretPosition();
  this.input.value =
    _0xbb6dbe.substring(0, _0x44ccac) +
    (":" + _0x4c0783 + ": ") +
    _0xbb6dbe.substring(_0x44ccac, _0xbb6dbe.length);
  this.input.focus();
  this.setCaretPosition(_0x44ccac + _0x4c0783.length + 3);
};
EmoteSelect.prototype.getCaretPosition = function () {
  if (this.input.selectionStart || this.input.selectionStart == "0") {
    return this.input.selectionStart;
  } else {
    return this.input.value.length;
  }
};
EmoteSelect.prototype.setCaretPosition = function (_0x59b4aa) {
  _0x59b4aa = Math.max(
    Math.min(_0x59b4aa, this.input.value.length),
    0,
  );
  if (this.input.setSelectionRange) {
    this.input.setSelectionRange(_0x59b4aa, _0x59b4aa);
  }
};
EmoteSelect.prototype.lastUsed = function () {
  if (typeof Storage != "undefined" && !localStorage.lastUsed) {
    let _0x5b68e0 = Math.floor(Date.now() / 1000);
    let _0x4ace29 = [
      {
        Badger: _0x5b68e0,
      },
      {
        jstris: _0x5b68e0,
      },
    ];
    localStorage.setItem("lastUsed", JSON.stringify(_0x4ace29));
  }
  let _0x38b4b5 = this.emotesWrapper;
  let _0x571444 = document.getElementById("Jstris");
  this.recent = document.createElement("div");
  this.recent.classList.add("emotesGroup");
  this.groupName = document.createElement("h3");
  this.groupName.classList.add("groupName");
  this.lastUsedWrapper = document.createElement("div");
  this.lastUsedWrapper.id = "usedWrapper";
  this.groupName.id = "recently-used";
  this.groupName.innerText = "RECENTLY USED";
  this.recent.appendChild(this.groupName);
  this.recent.appendChild(this.lastUsedWrapper);
  _0x38b4b5.insertBefore(this.recent, _0x571444);
  let _0x6d0e98 = this.selectionDiv;
  let _0x393e8a = document.getElementsByClassName("groupLink")[0];
  this.groupLink = document.createElement("img");
  this.groupLink.classList.add("groupLink");
  this.groupLink.setAttribute("data-groupName", "recently-used");
  this.groupLink.setAttribute("title", "Recently used");
  this.groupLink.setAttribute("data-toggle", "tooltip");
  this.groupLink.setAttribute("data-placement", "right");
  this.groupLink.setAttribute("src", this.path + "three_oclock.svg");
  this.groupLink.addEventListener("click", (_0x26f96d) => {
    let _0x2d57c1 = _0x26f96d.target.getAttribute("data-groupname");
    let _0x5a0a23 = document.getElementById(_0x2d57c1).offsetTop - 60;
    this.emotesWrapper.scrollTop = _0x5a0a23;
  });
  _0x6d0e98.insertBefore(this.groupLink, _0x393e8a);
  $('[data-toggle="tooltip"]').tooltip();
};
EmoteSelect.prototype.updateLastUsed = function () {
  let _0x38f023 = document.getElementById("usedWrapper");
  _0x38f023.innerHTML = "";
  let _0x3ac917 = this.emoteList;
  let _0x300718 = JSON.parse(localStorage.getItem("lastUsed"));
  let _0x4139e1 = document.createDocumentFragment();
  _0x300718.forEach((_0x3060c7) => {
    let _0x28f3be = Object.keys(_0x3060c7)[0];
    let _0x3145a2 = _0x3ac917.filter(
      (_0x50a359) => _0x50a359.n === _0x28f3be,
    )[0];
    if (_0x3145a2) {
      let _0x3cdfcb = this.getEmoteSource(_0x3145a2);
      this.usedImage = document.createElement("img");
      this.usedImage.setAttribute("src", _0x3cdfcb);
      this.usedImage.setAttribute("data-emoteName", _0x3145a2.n);
      this.usedImage.classList.add("emoteImg");
      if (_0x3145a2.u) {
        this.usedImage.classList.add("jstrisEmote");
      }
      this.usedImage.addEventListener("click", (_0x1c32c7) => {
        this.chatEmote(_0x1c32c7.target);
        this.setStoredEmotes(_0x1c32c7.target);
        if (!_0x1c32c7.shiftKey) {
          this.hideElem();
        }
      });
      this.usedImage.addEventListener("mouseover", (_0x284094) => {
        this.showName(_0x284094.target);
      });
      _0x4139e1.appendChild(this.usedImage);
    }
  });
  _0x38f023.appendChild(_0x4139e1);
};
EmoteSelect.prototype.setStoredEmotes = function (_0x33630f) {
  let _0x355848;
  let _0x41b001 = JSON.parse(localStorage.getItem("lastUsed"));
  let _0x1779d9 = _0x33630f.getAttribute("data-emoteName");
  if (_0x41b001.length > 24) {
    _0x355848 = [];
    for (let _0xb180ed = 0; _0xb180ed < 24; _0xb180ed++) {
      _0x355848.push(_0x41b001[_0xb180ed]);
    }
  }
  if (_0x41b001.length === 24) {
    let _0x273ddb = false;
    let _0x3d9593 = 0;
    for (let _0x4c5e31 of _0x41b001) {
      _0x3d9593 += 1;
      if (_0x1779d9 in _0x4c5e31) {
        _0x355848 = _0x41b001.filter(
          (_0x2a6419) =>
            _0x2a6419[_0x1779d9] === _0x41b001[_0x3d9593][_0x1779d9],
        );
        let _0x1f4075 = {
          [_0x1779d9]: Math.floor(Date.now() / 1000),
        };
        _0x355848.push(_0x1f4075);
        _0x273ddb = true;
        break;
      }
    }
    if (!_0x273ddb) {
      let _0xd26ed = _0x41b001[0][Object.keys(_0x41b001[0])[0]];
      let _0x33fb48 = _0x41b001[0];
      for (let _0x126172 of _0x41b001) {
        let _0x368a93 = Object.keys(_0x126172)[0];
        if (_0x126172[_0x368a93] < _0xd26ed) {
          _0xd26ed = _0x126172[_0x368a93];
          _0x33fb48 = _0x126172;
        }
      }
      _0x355848 = _0x41b001.filter(
        (_0x24f9bd) => _0x24f9bd !== _0x33fb48,
      );
      let _0x4920e0 = {
        [_0x1779d9]: Math.floor(Date.now() / 1000),
      };
      _0x355848.push(_0x4920e0);
    }
  } else if (_0x41b001.length < 24) {
    let _0x3f3a80 = false;
    let _0x41da7e = 0;
    for (let _0x5157bb of _0x41b001) {
      if (_0x1779d9 in _0x5157bb) {
        _0x355848 = _0x41b001.filter(
          (_0x24d7e4) =>
            _0x24d7e4[_0x1779d9] !== _0x41b001[_0x41da7e][_0x1779d9],
        );
        let _0x217d80 = {
          [_0x1779d9]: Math.floor(Date.now() / 1000),
        };
        _0x355848.push(_0x217d80);
        _0x3f3a80 = true;
        break;
      }
      _0x41da7e += 1;
    }
    if (!_0x3f3a80) {
      let _0x2355e3 = {
        [_0x1779d9]: Math.floor(Date.now() / 1000),
      };
      _0x355848 = _0x41b001;
      _0x355848.push(_0x2355e3);
    }
  }
  let _0x4b9b11 = _0x355848.sort(
    (_0x48c9c9, _0x55e0e1) =>
      _0x55e0e1[Object.keys(_0x55e0e1)[0]] -
      _0x48c9c9[Object.keys(_0x48c9c9)[0]],
  );
  localStorage.lastUsed = JSON.stringify(_0x4b9b11);
};
EmoteSelect.prototype.hideElem = function () {
  this.emotesWrapper.scrollTo(0, 0);
  this.selectionDiv.scrollTo(0, 0);
  this.emoteElem.classList.toggle("open");
};
EmoteSelect.prototype.openButtonLogic = function () {
  let _0x3747aa = document.getElementById("emoteSearch");
  this.openBtn.addEventListener("click", () => {
    _0x3747aa.value = "";
    let _0x35152f = document.getElementById("searchResults");
    if (_0x35152f !== null) {
      _0x35152f.parentNode.removeChild(_0x35152f);
    }
    this.emotesWrapper.scrollTo(0, 0);
    this.selectionDiv.scrollTo(0, 0);
    this.updateLastUsed();
    this.emoteElem.classList.toggle("open");
    if (this.emoteElem.classList.contains("open")) {
      _0x3747aa.focus();
    } else {
      document.getElementById("chatInput").focus();
    }
  });
  if (!document.getElementById("fuseScript")) {
    let _0x3fd722 = document.createElement("script");
    _0x3fd722.id = "fuseScript";
    _0x3fd722.src = "https://cdn.jsdelivr.net/npm/fuse.js@6.4.3";
    document.head.appendChild(_0x3fd722);
  }
};
