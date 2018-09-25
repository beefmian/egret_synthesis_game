var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var __extends = this && this.__extends || function __extends(t, e) { 
 function r() { 
 this.constructor = t;
}
for (var i in e) e.hasOwnProperty(i) && (t[i] = e[i]);
r.prototype = e.prototype, t.prototype = new r();
};
/**
 * 战斗地图
 */
var BattleMap = (function (_super) {
    __extends(BattleMap, _super);
    function BattleMap($controller, $layer) {
        var _this = _super.call(this, $controller, $layer) || this;
        /** 每只怪的出现时间 */
        _this._lastTime = 0;
        /** 是否界面初始化完毕 */
        _this._initComplete = false;
        _this.skinName = SkinName.BattleMapSkin;
        return _this;
    }
    /** 面板开启执行函数，用于子类继承 */
    BattleMap.prototype.open = function () {
        var param = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            param[_i] = arguments[_i];
        }
        _super.prototype.open.call(this, param);
        var self = this;
        self._battleController = param[0];
        self._model = self._battleController.getModel();
        self.init();
        self.initMap();
        self.addEvents();
        self.updateAllBaseItem();
        self._initComplete = true;
    };
    /** 初始化 */
    BattleMap.prototype.init = function () {
        var self = this;
        self._arrColl = new eui.ArrayCollection();
        self.lists.itemRenderer = BaseItem;
        self.lists.dataProvider = self._arrColl;
        self._starMonsterTime = egret.getTimer();
        self.heroBase.onAwake(self._battleController);
    };
    /** 初始化地图 */
    BattleMap.prototype.initMap = function () {
        var self = this;
        var path = PathConfig.MapPath.replace("{0}", self._model.levelVO.icon + "");
        App.DisplayUtils.addAsyncBitmapToImage(path, self.mapImg);
    };
    BattleMap.prototype.addEvents = function () {
        _super.prototype.addEvents.call(this);
        var self = this;
        self.btn_open.addEventListener(egret.TouchEvent.TOUCH_TAP, self.onOpenNewBase, self);
        self._battleController.registerFunc(BattleConst.CREATE_ROLE, self.onCreateRole, self);
        self._battleController.registerFunc(BattleConst.ROLE_ATTACK, self.onRoleAttack, self);
        App.StageUtils.getStage().addEventListener(egret.TouchEvent.TOUCH_BEGIN, self.onTouchBegin, self);
        // App.StageUtils.getStage().addEventListener(egret.TouchEvent.TOUCH_TAP, self.onTestHandler, self);
        self.setBtnEffect(["btn_open"]);
    };
    BattleMap.prototype.removeEvents = function () {
        _super.prototype.removeEvents.call(this);
        var self = this;
        self.btn_open.removeEventListener(egret.TouchEvent.TOUCH_TAP, self.onOpenNewBase, self);
        App.StageUtils.getStage().removeEventListener(egret.TouchEvent.TOUCH_BEGIN, self.onTouchBegin, self);
    };
    /** 获取怪物行走路径的坐标点 */
    BattleMap.prototype.onTestHandler = function (evt) {
        Log.trace("坐标：" + evt.stageX + "," + evt.stageY);
    };
    /** 角色攻击 */
    BattleMap.prototype.onRoleAttack = function (bulledId, x, y, target) {
        var self = this;
        var bullet = ObjectPool.pop(Bullet, "Bullet", self._battleController, LayerManager.GAME_MAP_LAYER);
        bullet.addToParent();
        bullet.setTarget(bulledId, x, y, target);
        bullet.rotation = App.MathUtils.getAngle(new egret.Point(x, y), target.point);
        self._model.bulletDic.Add(bullet.ID, bullet);
        var layer = App.LayerManager.getLayerByType(LayerManager.GAME_MAP_LAYER);
        layer.setChildIndex(bullet, layer.numChildren);
    };
    /** 开放新的底座 */
    BattleMap.prototype.onOpenNewBase = function () {
        var self = this;
        self._model.levelVO.openBaseCount += self._model.hBaseItemCount;
        if (self._model.levelVO.openBaseCount >= self._model.levelVO.maxBaseCount) {
            self._model.levelVO.openBaseCount = self._model.levelVO.maxBaseCount;
            self.btn_open.visible = self.btn_open.touchEnabled = false;
            self.doNeedUpdateBaseItem();
            return;
        }
        self.btn_open.y -= ((self._model.levelVO.maxBaseCount - self._model.levelVO.openBaseCount) / self._model.hBaseItemCount * self._model.levelVO.baseH);
        self.doNeedUpdateBaseItem();
    };
    /** 创建角色 */
    BattleMap.prototype.onCreateRole = function (roleId) {
        var self = this;
        if (roleId < 0)
            return Log.traceError("角色ID错误：" + roleId);
        var len = self._model.roleDic.GetLenght();
        if (len >= self._model.levelVO.openBaseCount)
            return App.MessageManger.showText(App.LanguageManager.getLanguageText("battle.txt.01"));
        while (len < self._model.levelVO.openBaseCount) {
            //在可以放置的底座中随机一个
            var random = App.RandomUtils.randrange(self._model.levelVO.maxBaseCount - self._model.levelVO.openBaseCount, self._model.levelVO.maxBaseCount);
            var baseItem = self.lists.getChildAt(random);
            if (!self._model.roleDic.ContainsKey(baseItem) && baseItem.state == BASE_STATE.OPEN) {
                self.updateHeroBase(roleId);
                self._battleController.pushRoleToMap(roleId, baseItem);
                break;
            }
        }
    };
    /** 更新所有底座数据 */
    BattleMap.prototype.updateAllBaseItem = function () {
        var self = this;
        self._arrColl.replaceAll(self._model.allBaseState);
    };
    /** 处理需要更新的底座 */
    BattleMap.prototype.doNeedUpdateBaseItem = function () {
        var self = this;
        var startI = self._model.levelVO.maxBaseCount - self._model.levelVO.openBaseCount;
        var len = startI + self._model.hBaseItemCount;
        for (var i = startI; i < len; i++) {
            self.lists.getChildAt(i).state = BASE_STATE.OPEN;
        }
    };
    BattleMap.prototype.onTouchBegin = function (evt) {
        var self = this;
        if (!evt.target || !(evt.target instanceof BaseItem))
            return;
        App.StageUtils.getStage().removeEventListener(egret.TouchEvent.TOUCH_BEGIN, self.onTouchBegin, self);
        App.StageUtils.getStage().addEventListener(egret.TouchEvent.TOUCH_MOVE, self.onTouchMove, self);
        App.StageUtils.getStage().once(egret.TouchEvent.TOUCH_END, self.onTouchEnd, self, true);
        self._selectRole = self._model.roleDic.TryGetValue(evt.target);
        self._selectRole.isMove = true;
        self._oX = self._selectRole.x;
        self._oY = self._selectRole.y;
        self._selectRole.x = evt.stageX;
        self._selectRole.y = evt.stageY;
        //设置拿起来的角色层级一定是最高的
        var layer = App.LayerManager.getLayerByType(LayerManager.GAME_MAP_LAYER);
        layer.setChildIndex(self._selectRole, layer.numChildren);
    };
    BattleMap.prototype.onTouchMove = function (evt) {
        var self = this;
        self._selectRole.x = evt.stageX;
        self._selectRole.y = evt.stageY;
    };
    BattleMap.prototype.onTouchEnd = function (evt) {
        var self = this;
        App.StageUtils.getStage().removeEventListener(egret.TouchEvent.TOUCH_MOVE, self.onTouchMove, self);
        App.StageUtils.getStage().addEventListener(egret.TouchEvent.TOUCH_BEGIN, self.onTouchBegin, self);
        var baseItem = evt.target;
        self._selectRole.isMove = false;
        if (!(evt.target instanceof BaseItem) || !baseItem || baseItem.state == BASE_STATE.CLOSE || baseItem.hashCode == self._selectRole.baseItem.hashCode) {
            self._selectRole.x = self._oX;
            self._selectRole.y = self._oY;
            return;
        }
        if (baseItem.state == BASE_STATE.OPEN) {
            self.createRole(self._selectRole, baseItem, self._selectRole.roleId);
        }
        else if (baseItem.state == BASE_STATE.HAVE) {
            var role = self._model.roleDic.TryGetValue(baseItem);
            var moveRole = self._model.roleDic.TryGetValue(self._selectRole.baseItem);
            if (role.roleId == moveRole.roleId) {
                self._model.roleDic.Remove(moveRole.baseItem);
                moveRole.baseItem.state = BASE_STATE.OPEN;
                moveRole.reset();
                ObjectPool.push(moveRole);
                App.DisplayUtils.removeFromParent(moveRole);
                self.createRole(role, baseItem, role.roleId + 1);
            }
            else {
                self.createRole(role, self._selectRole.baseItem, role.roleId);
                self.createRole(self._selectRole, baseItem, self._selectRole.roleId);
            }
        }
    };
    /** 创建普通角色 */
    BattleMap.prototype.createRole = function (selectRole, baseItem, roleId) {
        var self = this;
        self._model.roleDic.Remove(selectRole.baseItem);
        selectRole.reset();
        ObjectPool.push(selectRole);
        App.DisplayUtils.removeFromParent(selectRole);
        self.updateHeroBase(roleId);
        self._battleController.pushRoleToMap(roleId, baseItem);
    };
    /** 更新英雄底座上的英雄角色 */
    BattleMap.prototype.updateHeroBase = function (roleId) {
        var self = this;
        if (roleId < self._model.maxRoleId)
            return;
        self._model.maxRoleId = roleId;
        self.heroBase.updateHeroStyle(self._model.maxRoleId);
    };
    /** 更新怪物 -- 出怪 */
    BattleMap.prototype.updateMonster = function (passTime) {
        if (this._initComplete && passTime > this._lastTime) {
            this._model.currMonsterCount++;
            this.createMonster();
            this._lastTime = passTime + this._model.levelVO.monsterDelay;
        }
        /** 当前波数的怪物已经全部出战完毕 */
        if (this._initComplete && this._model.currMonsterCount >= this._model.maxMonsterCount) {
            //波数+1
            this._model.currwaveNum++;
            //重新设置当前波数的怪物
            this._model.currMonsterCount = 0;
            this._model.maxMonsterCount = this._model.monsterWaveNumCount;
            this._battleController.applyFunc(BattleConst.MONSTER_WAVENUM_COMPLETE);
        }
    };
    /** 创建怪物 */
    BattleMap.prototype.createMonster = function () {
        // if (this._starMonsterTime <= egret.getTimer()) {
        var monster = ObjectPool.pop(Monster, "Monster", this._battleController, LayerManager.GAME_MAP_LAYER);
        monster.addToParent();
        var info = ObjectPool.pop(MonsterInfo, "MonsterInfo");
        //给怪一个行走路径
        info.path = this._model.levelVO.path;
        var num = App.RandomUtils.randrange(0, 3);
        info.monsterVO = GlobleVOData.getData(GlobleVOData.MonsterVO, num);
        monster.Parse(info);
        this._model.monsterDic.Add(monster.ID, monster);
        // }
    };
    return BattleMap;
}(BaseEuiView));
__reflect(BattleMap.prototype, "BattleMap");
//# sourceMappingURL=BattleMap.js.map