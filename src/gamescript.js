var world,
    worldScale = 30,
    gameLayer,
    background,
    actorManager,
    totemSprite;

var GameScene = cc.Scene.extend({
    onEnter: function(){
        this._super();
        actorManager = new ActorManager();
        gameLayer = new GameLayer();
        gameLayer.init();
        this.addChild(gameLayer);
    }
});

var GameLayer = cc.Layer.extend({
    init: function(){
        this._super();

        // Setup the background
        background = new BackgroundSprite();
        this.addChild(background);

        // Setup the physics engine
        var gravity = new Box2D.Common.Math.b2Vec2(0, -10);
        world = new Box2D.Dynamics.b2World(gravity, true);

        var groundSprite = new GroundSprite();
        actorManager.addActor(groundSprite);

        totemSprite = new TotemSprite();
        actorManager.addActor(totemSprite);

        this.scheduleUpdate();

        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed:  function(keyCode, event){
                if(keyCode == 32)
                    totemSprite.jump();
            },
            onKeyReleased: function(keyCode, event){}
        }, this);
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function(touch, event){
                totemSprite.jump();
            }
        }, this);
    },
    // Do stuff for each step
    update: function(dt){
        background.scroll();
        world.Step(dt, 10, 10);
        actorManager.updateActors();

        /*
         var debugDraw = new Box2D.Dynamics.b2DebugDraw();
         debugDraw.SetSprite(document.getElementById("debug").getContext("2d")); // test is the id of another canvas which debugdraw works on
         debugDraw.SetDrawScale(30.0);
         debugDraw.SetFillAlpha(0.3);
         debugDraw.SetLineThickness(1.0);
         debugDraw.SetFlags(Box2D.Dynamics.b2DebugDraw.e_shapeBit | Box2D.Dynamics.b2DebugDraw.e_jointBit);
         world.SetDebugDraw(debugDraw);
         world.DrawDebugData();
         */
    }
});

var ActorManager = function(){
    var actors = [];
    this.addActor = function(actor){
        actors.push(actor);
        gameLayer.addChild(actor);
    }

    this.updateActors = function(){
        for(var i = 0, actor = actors[i]; i < actors.length; i++, actor = actors[i]){
            actor.update();
        }
    }
}


var BackgroundSprite = cc.Sprite.extend({
    scrollSpeed: 1,
    ctor:function(){
        this._super();
        this.initWithFile('res/background.png');
        this.setPosition(480, 160);
    },
    scroll: function(){
        this.setPosition(this.getPosition().x-this.scrollSpeed, this.getPosition().y);
        if(this.getPosition().x < 0){
            this.setPosition(this.getPosition().x+480, this.getPosition().y)
        }
    }
});

var ActorSprite = cc.Sprite.extend({
    ctor: function(isDynamic, xPos, yPos, width, height) {
        this._super();

        // From Totem
        var fixtureDef = new Box2D.Dynamics.b2FixtureDef;
        fixtureDef.density = 1.0;
        fixtureDef.friction = 0.5
        fixtureDef.restitution = 0.0; // Bounce
        fixtureDef.shape = new Box2D.Collision.Shapes.b2PolygonShape;
        fixtureDef.shape.SetAsBox(0.5*width/worldScale,0.5*height/worldScale);

        var bodyDef = new Box2D.Dynamics.b2BodyDef;

        if(isDynamic){
            bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
        }
        else{
            bodyDef.type = Box2D.Dynamics.b2Body.b2_staticBody;
        }

        bodyDef.position.Set(xPos/worldScale, yPos/worldScale);

        this.setPosition(xPos, yPos);

        this.body = world.CreateBody(bodyDef);
        this.body.CreateFixture(fixtureDef)
    },
    update: function(){
        this.setPosition(this.body.GetPosition().x * worldScale, this.body.GetPosition().y * worldScale);
        this.setRotation(-1 * cc.radiansToDegress(this.body.GetAngle()));
    }
});

var GroundSprite = ActorSprite.extend({
    scrollSpeed: 3,
    ctor: function(){
        this._super(false, 240,10,480,20);
        this.initWithFile('res/ground.png');
    },
    update: function(){
        this.setPosition(this.getPosition().x-this.scrollSpeed, this.getPosition().y);
        if(this.getPosition().x < 17){
            this.setPosition(240, this.getPosition().y)
        }
    }
});

var TotemSprite = ActorSprite.extend({
    jumpStrength: 6,
    ctor: function(){
        this._super(true, 75,45,24,48);
        this.initWithFile('res/totem.png');
    },
    jump: function(){
        this.body.ApplyImpulse(
            new Box2D.Common.Math.b2Vec2(0,this.jumpStrength),
            this.body.GetWorldCenter()
        );
    }
})

