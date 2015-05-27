cc.game.onStart = function(){
    cc.view.setDesignResolutionSize(480, 320, cc.ResolutionPolicy.SHOW_ALL);
    cc.LoaderScene.preload(gameResources, function(){
        cc.director.runScene(new GameScene());
    }, this);
}
cc.game.run();

