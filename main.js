var startUniverse = function(){
    var canvas = document.getElementById("space");
    var ctx = canvas.getContext('2d');

    //init
    var m_sun=750000000;
    var G=6e-6;
    universe.init(G, 800);
    var max_elem = 100;
    var max_time = 20;
    var speed_init = 90;

    // SOLAR SYSTEM
    /*
    universe.addElement(m_sun, 30, 400, 400, 0, 0,"rgb(200,0,0)");
    for (var i = 0; i < max_elem; i++) {

        var rand_m=7500 + Math.random() * 1e3;
        var rand_angle = Math.random()* Math.PI * 2;
        var rand_rayon = Math.random() * 300 + 50;
        var orbit_speed = Math.sqrt((m_sun*m_sun*G)/((m_sun+rand_m)*rand_rayon));

        universe.addElement(rand_m,
                Math.round(4 + Math.random() * 3),
                400 + Math.round(rand_rayon*Math.cos(rand_angle)),
                400 + Math.round(rand_rayon*Math.sin(rand_angle)),
                -orbit_speed*Math.sin(rand_angle),
                orbit_speed*Math.cos(rand_angle),
                "rgb("+Math.round(Math.random() * 150)+","+Math.round(Math.random() * 150)+","+Math.round(Math.random() * 150)+")"
        );
    }
    //*/

    //5 balls
    //*
    universe.addElement(m_sun, 30, 450, 400, 0, 0,"rgb(200,0,0)");
    universe.addElement(750000, 20, 150, 150, 0, 0);
    universe.addElement(7500, 4, 350, 350, 0, speed_init);
    universe.addElement(600000, 4, 450, 450, 0, -speed_init);
    universe.addElement(800000, 4, 350, 450, speed_init, 0);
    universe.addElement(100000, 4, 450, 350, -speed_init, 0);
    //*/

    // 2 balls
    //*
    universe.addElement(9500000, 25, 300, 400, 100, 0,"rgb(0,100,50)");
    universe.addElement(7500000, 5, 500, 420, -100, 0,"rgb(100,10,0)");
    //*/

    universe.logAll();
    universe.drawAll(ctx);

    //loop
    var dt = null;
    var last_t = null;
    var run_t = null;
    var start = null;
    var perf_t;
    function runUniverse(dt){

        ctx.clearRect(0, 0, 800, 800);
        universe.drawAll(ctx);
        universe.moveAll(dt);
        universe.computePhysics(dt);
        universe.computeCollisions();
    };

    function mainLoop() {
        var t = new Date().getTime() / 1000;
        if (last_t === null) {
            last_t = t;
        }
        if (start === null) {
            start = t;
        }

        dt = t - last_t;
        last_t = t;
        run_t = t-start;

        if (run_t < max_time) {
            window.requestAnimationFrame(mainLoop);
        } else {
            universe.logAll();
        }

        runUniverse(dt);

        /*
        ctx.clearRect(0, 0, 800, 800);
        perf_t = new Date().getTime();
        universe.drawAll(ctx);

        var do_perf = (Math.floor(run_t*100) % 200)==0 && false;

        if (do_perf) {
            console.log("draw ("+Math.floor(run_t)+") :" + (new Date().getTime() - perf_t));
            perf_t = new Date().getTime();
        }

        universe.moveAll(dt);

        if (do_perf) {
            console.log("move :" + (new Date().getTime() - perf_t));
            perf_t = new Date().getTime();
        }

        universe.computePhysics(dt);
        universe.computeCollisions();

        if (do_perf) {
            console.log("physics :" + (new Date().getTime() - perf_t));
        }*/
    };

    mainLoop();
};
