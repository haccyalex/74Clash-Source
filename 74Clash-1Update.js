// 74Clash-first-update
// t.me/seventyfourteam 
const base = Module.findBaseAddress("libg.so");
Memory.protect(base.add(0x2BAECD), 11, "rwx");
base.add(0x2BAECD).writeUtf8String("74Team");
Memory.protect(base.add(0x2B05E6), 11, "rwx");
base.add(0x2B05E6).writeUtf8String("74Team");
base.add(0x2F728C).writeU8(1);
var stage_address;
var debugmenutype = 0;
var dptr;
var effectPreviewUpdate;

const EffectPreviewCtorPtr = 0x00F93E0 + 1;
const EffectPreviewButtonButtonPressedPtr = 0x00F974C + 1;

const Libg = {
    init() {
        this.lib = Module.findBaseAddress('libg.so');
        log(this.lib);

        this.libc = {
            addr: {
                malloc: Module.findExportByName('libc.so', 'malloc'),
                getaddrinfo: Module.findExportByName('libc.so', 'getaddrinfo'),
                free: Module.findExportByName("libc.so", "free")
            },
            malloc(size) {
                return new NativeFunction(this.addr.malloc, 'pointer', ['int'])(size);
            },
            free(value) {
                return new NativeFunction(Libg.libc.addr.free, 'void', ['pointer'])(value);
            }
        }

        this.Stage = {
            addr: {
                ctor: Libg.offset("_ZN5StageC2Ev"),
                addChild: Libg.offset("_ZN5Stage8addChildEP13DisplayObject"),
                removeChild: Libg.offset("_ZN5Stage11removeChildEP13DisplayObject"),
                instance: Libg.offset("_ZN5Stage12sm_pInstanceE")
            },
            addChild(stage, displayObject) {
                return new NativeFunction(Libg.Stage.addr.addChild, "int", ["pointer", "pointer"])(stage, displayObject);
            },
            removeChild(stage_address, displayObject) {
                return new NativeFunction(Libg.Stage.addr.removeChild, "int", ["pointer", "pointer"])(stage_address, displayObject);
            }
        }

        this.MoneyHud = {
            addr: {
                ctor: Libg.offset("_ZN8MoneyHUDC2EP9MovieClip")
            }
        }

        this.String = {
            addr: {
                ctor: Libg.offset("_ZN6StringC2EPKc")
            },
            ctor(str) {
                var mem = Libg.libc.malloc(32);
                new NativeFunction(this.addr.ctor, 'void', ['pointer', 'pointer'])(mem, str);
                return mem;
            }
        }

        this.MagicButton = {
            addr: {
                ctor: Libg.offset("_ZN11MagicButtonC2Ev")
            },
            ctor(ptr) {
                new NativeFunction(this.addr.ctor, 'void', ['pointer'])(ptr);
            }
        }

        this.CustomButton = {
            addr: {
                setMovieClip: Libg.offset("_ZN12CustomButton12setMovieClipEP9MovieClipb")
            },
            setMovieClip(ptr, clip, bool) {
                return new NativeFunction(this.addr.setMovieClip, 'int', ['pointer', 'pointer', 'int'])(ptr, clip, bool);
            }
        }

        this.StringTable = {
            addr: {
                getMovieClip: Libg.offset("_ZN11StringTable12getMovieClipERK6StringS2_")
            },
            getMovieClip(ptr, ptr1) {
                return new NativeFunction(this.addr.getMovieClip, 'pointer', ['pointer', 'pointer'])(ptr, ptr1);
            }
        }

        this.DebugMenu = {
            addr: {
                ctor: Libg.offset("_ZN9DebugMenuC2Ev")
            },
            DebugMenuCtor(ptr) {
                return new NativeFunction(Libg.DebugMenu.addr.ctor, "void", ["pointer"])(ptr);
            }
        }

        this.HUD = {
            addr: {
                update: Libg.offset("_ZN3HUD6updateEf")
            }
        }

        this.DebugMenuBase = {
            addr: {
                update: Libg.offset("_ZN13DebugMenuBase6updateEf")
            },
            DebugMenuBaseUpdate(ptr, fl) {
                return new NativeFunction(Libg.DebugMenuBase.addr.update, "int", ["pointer", "float"])(ptr, fl);
            }
        }
            
        this.EffectPreviewBase = {
            addr: {
                update: Libg.offset("_ZN17EffectPreviewBase6updateEf")
            },
            EffectPreviewBaseUpdate(ptr, fl) {
                return new NativeFunction(Libg.EffectPreviewBase.addr.update, "int", ["pointer", "float"])(ptr, fl);
            }
        }
        
        this.ToggleDebugMenuButton = {
            addr: {
                buttonPressed: Libg.offset("_ZN21ToggleDebugMenuButton13buttonPressedEv")
            }
        }

        this.GameMode = {
            addr: {
                addResourcesToLoad: Libg.offset("_ZN8GameMode18addResourcesToLoadEP16ResourceListener")
            }
        }

        this.ResourceListener = {
            addr: {
                addFile: Libg.offset("_ZN16ResourceListener7addFileEPKc")
            },
            addFile(ctor, value) {
                return new NativeFunction(Libg.ResourceListener.addr.addFile, "void", ["pointer", "pointer"])(ctor, value);
            }
        }

        this.LogicMissionManager = {
            addr: {
                isTutorialCompleted: Libg.offset("_ZNK19LogicMissionManager19isTutorialCompletedEv")
            }
        }
    },
    offset(value) {
        return Module.findExportByName("libg.so", value);
    }
}

function fStageRemoveChild(stage, child) {
    return new NativeFunction(Libg.Stage.addr.removeChild, "int", ["pointer", "pointer"])(stage, child);
}

function fStageAddChild(stage, child) {
    return new NativeFunction(Libg.Stage.addr.addChild, "int", ["pointer", "pointer"])(stage, child);
}

function fEffectPreviewCtor(ptr) {
    return new NativeFunction(base.add(EffectPreviewCtorPtr), "void", ["pointer"])(ptr);
}

function malloc(size) {
    return Libg.libc.malloc(size);
}

function free(ptr) {
    return Libg.libc.free(ptr);
}

function InitUiButton(btnPtr, text, x, y, fileName = "sc/debug.sc") {
    let fileNameStr = Libg.String.ctor(Memory.allocUtf8String(fileName));
    let scTextStr = Libg.String.ctor(Memory.allocUtf8String(text));

    let movieClip = Libg.StringTable.getMovieClip(fileNameStr, scTextStr);
    Libg.CustomButton.setMovieClip(btnPtr, movieClip, 1);

    new NativeFunction(Libg.offset("_ZN13DisplayObject5setXYEff"), 'int', 
        ['pointer', 'float', 'float'])(btnPtr, x, y);
    
    Libg.Stage.addChild(Libg.Stage.addr.instance.readPointer(), btnPtr);
}

const Stage = {
    init() {
        var stage = Interceptor.attach(Libg.Stage.addr.ctor, {
            onEnter(args) {
                log("Stage::Stage() called");
                stage.detach();
                stage_address = args[0];
            }
        });
    }
}

const LoadGame = {
    init() {
        var load = Interceptor.attach(Libg.GameMode.addr.addResourcesToLoad, {
            onEnter(args) {
                log("GameMode::addResourcesToLoad called");
                load.detach();
                Libg.ResourceListener.addFile(args[1], Memory.allocUtf8String("sc/debug.sc"));
                log("The sc/debug.sc has been loaded!");
            }
        });
    }
}

const TutorialCompleted = {
    init() {
        var tutorialHook = Interceptor.attach(Libg.LogicMissionManager.addr.isTutorialCompleted, {
            onLeave(retval) {
                retval.replace(ptr("0x1"));
            }
        });
    }
}

const GameLoaded = {
    init() {
        var gameLoaded = Interceptor.attach(Libg.MoneyHud.addr.ctor, {
            onEnter(args) {
                let opened = false;
                let debugMenuPtr;
                var hudUpdate;

                log("MoneyHUD::MoneyHUD() called");
                gameLoaded.detach();

                let dbgBtn = Libg.libc.malloc(300);
                Libg.MagicButton.ctor(dbgBtn);
                InitUiButton(dbgBtn, "debug_menu_button", 1150, 0);

                let extraBtn = Libg.libc.malloc(300);
                Libg.MagicButton.ctor(extraBtn);
                InitUiButton(extraBtn, "debug_button", 1070, 275, "sc/ui.sc");

                var effectButton = Interceptor.attach(base.add(EffectPreviewButtonButtonPressedPtr), {
                    onEnter: function(args) {
                        if(debugmenutype === 0) {
                            dptr = malloc(500);
                            fEffectPreviewCtor(dptr);
                            fStageAddChild(stage_address, dptr);
                            debugmenutype = 2;
                            
                            effectPreviewUpdate = Interceptor.attach(Libg.HUD.addr.update, {
                                onEnter(args) {
                                    Libg.EffectPreviewBase.EffectPreviewBaseUpdate(dptr, 20);
                                }
                            });
                        }
                    }
                });
                
                Interceptor.attach(Libg.offset("_ZN21ToggleDebugMenuButton13buttonPressedEv"), {
                    onEnter(args) {
                        if (debugmenutype === 2) {
                            effectPreviewUpdate.detach();
                            fStageRemoveChild(stage_address, dptr);
                            free(dptr);
                            debugmenutype = 0;
                        }
                    }
                });
                
                Interceptor.attach(Libg.offset("_ZN12CustomButton13buttonPressedEv"), {
                    onEnter(args) {
                        if (args[0].toInt32() == dbgBtn.toInt32()) {
                            log("Debug btn pressed!")
                            if (debugmenutype === 2) {
                                effectPreviewUpdate.detach();
                                fStageRemoveChild(stage_address, dptr);
                                free(dptr);
                                debugmenutype = 0;
                                return;
                            }
                            if (!opened) {
                                opened = true;
                                toast("Debug Menu open!!!");
                                debugMenuPtr = Libg.libc.malloc(1000);
                                dptr = debugMenuPtr;
                                Libg.DebugMenu.DebugMenuCtor(debugMenuPtr);
                                Libg.Stage.addChild(Libg.Stage.addr.instance.readPointer(), debugMenuPtr);
                                log("DebugMenu is displayed");

                                hudUpdate = Interceptor.attach(Libg.HUD.addr.update, {
                                    onEnter(args) {
                                        Libg.DebugMenuBase.DebugMenuBaseUpdate(debugMenuPtr, 20);
                                    }
                                });

                                Interceptor.attach(Libg.ToggleDebugMenuButton.addr.buttonPressed, {
                                    onEnter(args) {
                                        opened = false;
                                        hudUpdate.detach();
                                        Libg.Stage.removeChild(Libg.Stage.addr.instance.readPointer(), debugMenuPtr);
                                        Libg.libc.free(debugMenuPtr);
                                    }
                                });
                            }
                            else {
                                opened = false;
                                toast("Debug menu closed!!!");
                                hudUpdate.detach();
                                Libg.Stage.removeChild(Libg.Stage.addr.instance.readPointer(), debugMenuPtr);
                                Libg.libc.free(debugMenuPtr);
                                debugmenutype = 0;
                            }
                        }
                        else if (args[0].toInt32() == extraBtn.toInt32()) {
                            log("Extra button pressed!");
                            toast("Offline mode by 74Team <3");
                        }
                    }
                })
            }
        });
    }
}

function initDebugFeatures() {
    try {
        Libg.init();
        Stage.init();
        LoadGame.init();
        TutorialCompleted.init();
        GameLoaded.init();
    } catch (ex) {
        log("Error initializing debug features: " + ex.stack);
    }
}

function log(str) {
    console.log("[*] " + str);
}

String.prototype.ptr = function() {
    return Memory.allocUtf8String(this);
}

String.prototype.scptr = function() {
    return Libg.String.ctor(this.ptr())
}

initDebugFeatures();

function toast(toastText) {	
    Java.perform(function() { 
        var context = Java.use('android.app.ActivityThread').currentApplication().getApplicationContext();

        Java.scheduleOnMainThread(function() {
            var toast = Java.use("android.widget.Toast");
            toast.makeText(context, Java.use("java.lang.String").$new(toastText), 1).show();
        });
    });
}
toast("t.me/seventyfourteam");