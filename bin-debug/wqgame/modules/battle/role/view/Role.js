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
var Role = (function (_super) {
    __extends(Role, _super);
    function Role($controller, $layer) {
        var _this = _super.call(this, $controller, $layer) || this;
        _this.lastTime = 0;
        _this._isMove = false;
        var self = _this;
        self.touchChildren = self.touchEnabled = false;
        self._model = self.controller.getModel();
        return _this;
    }
    /** 面板开启执行函数，用于子类继承 */
    Role.prototype.open = function () {
        var param = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            param[_i] = arguments[_i];
        }
        _super.prototype.open.call(this, param);
        var self = this;
        self._roleId = param[0];
        self._heroVO = GlobleVOData.getData(GlobleVOData.HeroVO, self._roleId);
        self.initRole();
    };
    /** 初始化角色 */
    Role.prototype.initRole = function () {
        var self = this;
        App.DisplayUtils.removeFromParent(self._roleImg);
        self._roleImg = new eui.Image(self._heroVO.assetname);
        self.addChild(self._roleImg);
    };
    Role.prototype.onUpdate = function (passTime) {
        _super.prototype.onUpdate.call(this, passTime);
        if (this._isMove)
            return;
        this.searchTarget();
    };
    /** 设置坐标点 */
    Role.prototype.setPosition = function ($x, $y) {
        var self = this;
        self.x = $x;
        self.y = $y;
    };
    /** 选择攻击目标 */
    Role.prototype.searchTarget = function () {
        var self = this;
        var monsters = this._model.monsterDic.getValues();
        for (var i = 0; i < monsters.length; i++) {
            if (App.MathUtils.getDistance(this.x, this.y, monsters[i].x, monsters[i].y) <= self._heroVO.distance) {
                self.createBullet(monsters[i]);
                break;
            }
        }
    };
    /** 创建子弹 */
    Role.prototype.createBullet = function (monster) {
        var nowTime = egret.getTimer();
        if (nowTime > this.lastTime) {
            this.lastTime = nowTime + this._heroVO.delay; //下次执行时间
            this.controller.applyFunc(BattleConst.ROLE_ATTACK, this._heroVO.bulletId, this.x, this.y, monster);
        }
    };
    /** 重置 */
    Role.prototype.reset = function () {
        var self = this;
        self._baseItem = null;
    };
    Object.defineProperty(Role.prototype, "heroVO", {
        get: function () {
            return this._heroVO;
        },
        set: function (value) {
            this._heroVO = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Role.prototype, "roleImg", {
        get: function () {
            return this._roleImg;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Role.prototype, "roleId", {
        get: function () {
            return this._roleId;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Role.prototype, "baseItem", {
        get: function () {
            return this._baseItem;
        },
        set: function (value) {
            this._baseItem = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Role.prototype, "isMove", {
        /** 是否在移动合成中 */
        get: function () {
            return this._isMove;
        },
        set: function (value) {
            this._isMove = value;
        },
        enumerable: true,
        configurable: true
    });
    return Role;
}(BaseRole));
__reflect(Role.prototype, "Role");
//# sourceMappingURL=Role.js.map