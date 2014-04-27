var universe = (function () {
    var elements = [];
    var G = 6e-4;
    var size = 800;

    return {
        init: function(newG, newSize){
            G = newG;
            size = newSize;
        },

        addElement: function (m, r, x, y, dx, dy, color) {
            var newEl = {
                m: m,
                r: r,
                x: x,
                y: y,
                dx: dx,
                dy: dy,
                color: color,

                draw: function (ctx) {
                    ctx.fillStyle = this.color;

                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, true);
                    ctx.fill();
                    ctx.stroke();


                    ctx.fillStyle = "rgb(0,200,0)";

                    ctx.beginPath(this.x, this.y);
                    ctx.lineTo(this.dx, this.dy);
                    ctx.fill();
                    ctx.stroke();
                },

                move: function (dt) {
                    if (dt > 0) {
                        var new_x = this.x + this.dx * dt;
                        var new_y = this.y + this.dy * dt;

                        if (new_x < 0 || new_x > size) {
                            new_x = (((new_x % size) + size) % size);
                        }
                        if (new_y < 0 || new_y > size) {
                            new_y = (((new_y % size) + size) % size);
                        }
                        this.x = new_x;
                        this.y = new_y;
                    }
                },

                addSpeed: function (dvx, dvy, dt) {
                    //console.log("dv=("+dvx+";"+dvy+")");
                    this.dx += dvx;
                    this.dy += dvy;
                    //this.dx = Math.exp(-dt)*this.dx;
                    //this.dy = Math.exp(-dt)*this.dy;
                },

                collideWith: function(e){
                    //var
                    //if
                    var min_dist = e.r + this.r;
                    var current_dist = Math.sqrt(Math.pow(e.x - this.x, 2) + Math.pow(e.y - this.y, 2));
                    return current_dist <= min_dist;
                },

                bounce: function(e){
                /*
                e_collision = 1/2 * m1 * v1_dir_colision²
                e_ext = 1/2 * m2 * v2_dir_colision²
                e_apres = e_avant - e_collision + e_ext
                e_avant = 1/2 * m1 * v_avant ²
                e_collision = 1/2 * min(m1, m2) * v1_dir_colision ²
                e_ext = 1/2 * min(m1, m2) * v2_dir_colission ²

                v_apres² = v_avant ² - min(m1, m2)/m1 * v1_dir_colision² + min(m1, m2)/m1 * v2_dir_colission²

                v_dir_colission = v . n

                n must be normalized
                */
                //*
                    var n = {
                        x: e.x - this.x,
                        y: e.y - this.y
                    };

                    n_magn = Math.sqrt(Math.pow(n.x, 2) + Math.pow(n.y, 2));
                    n = {
                        x: n.x / n_magn,
                        y: n.y / n_magn
                    }
                //*/

                    var speed_old_2 = Math.pow(this.dx, 2) + Math.pow(this.dy, 2);
                    var v1_dir_colission_2 = Math.pow(this.dx * n.x + this.dy * n.y, 2);
                    var mass_min_ratio = Math.min(this.m, e.m) / this.m;
                    var mass_max_ratio = Math.max(this.m, e.m) / this.m;
                    var v2_dir_colission_2 = Math.pow(e.dx * n.x + e.dy * n.y, 2);
                    var speed_new_2 = speed_old_2 - mass_min_ratio * v1_dir_colission_2 + mass_min_ratio * v2_dir_colission_2;
                    var speed_new = Math.sqrt(speed_new_2);

                    console.log("speed_old="+ Math.sqrt(speed_old_2) + "  |  speed_new="+speed_new);
                    console.log("nx="+ n.x + "    |    ny="+n.y);
                    console.log("m1="+ this.m + "    |    m2="+e.m);

                    this.dx = this.dx - speed_new * n.x;
                    this.dy = this.dy - speed_new * n.y;

                    var min_dist = e.r + this.r;
                    var current_dist = Math.sqrt(Math.pow(e.x - this.x, 2) + Math.pow(e.y - this.y, 2));
                    // more than 1/2 to avoid double bounce and /1024 is easy to compute
                    var elastic_bounce_dist = (min_dist - current_dist) /2 ;

                    this.x -= elastic_bounce_dist * n.x;
                    this.y -= elastic_bounce_dist * n.y;

                    var energy_loss = 1 - (min_dist - current_dist) / min_dist;
                    console.log("enery to "+ Math.floor(energy_loss*100) + "%");
                    this.dx *= energy_loss;
                    this.dy *= energy_loss;


                },

                getForceVectorFrom: function (e) {
                    var vx = (e.x - this.x);
                    var vy = (e.y - this.y);
                    var dist2 = Math.pow(vx, 2) + Math.pow(vy, 2);
                    var dist_inv, Fe;
                    if (dist2 > 0) {
                        dist_inv = 1 / Math.sqrt(dist2);
                        Fe = G * e.m * this.m / dist2;
                    } else {
                        console.log("error ? dist2=" + dist2);
                        dist_inv = 0;
                        Fe = 0;
                    }
                    //console.log("Fe="+Fe + "/e.m=" + e.m + "/this.m=" + this.m + "/dist2=" + dist2 + "/dist_inv=" + dist_inv + "/vx=" + vx + "/vy=" + vy);

                    return {
                        x: Fe * vx * dist_inv,
                        y: Fe * vy * dist_inv
                    };
                }
            };

            elements.push(newEl);
        },

        logAll: function () {
            console.log(elements);
        },

        drawAll: function (ctx) {
            for (var i in elements) {
                elements[i].draw(ctx);
            }
        },

        moveAll: function (dt) {
            for (var i in elements) {
                elements[i].move(dt);
            }
        },

        computePhysics: function (dt) {
            var Fsum;
            var e_current;
            var m_inv_dt;
            var Fij, Fji;
            var cache_array=[]

            for (var i in elements) {
                cache_array[i]=[]
                Fsum = {
                    x: 0,
                    y: 0
                };
                e_current = elements[i];
                m_inv_dt = dt / e_current.m;

                for (var j in elements) {
                    if (i != j) {
                        if (cache_array[j] && cache_array[j][i]){
                            Fji = cache_array[j][i]
                        } else {
                            Fji = e_current.getForceVectorFrom(elements[j]);
                            Fij = {
                                x: -Fji.x,
                                y: -Fji.y
                            }
                            cache_array[i][j] = Fij
                        }
                        //console.log("F" + j + "-" + i + "=(" + Fji.x + ";" + Fji.y + ")");
                        Fsum.x += Fji.x;
                        Fsum.y += Fji.y;
                    }
                }

                e_current.addSpeed(Fsum.x * m_inv_dt, Fsum.y * m_inv_dt, dt);
            }
        },

        computeCollisions: function(){
            console.log("========== Collisions ? ===============");
            var max = elements.length;
            for (var i=0; i<max; i++) {
                for (var j=i+1; j<max; j++) {
                var ei = elements[i];
                var ej = elements[j];
                    if(ei.collideWith(ej)){
                        var nji = {
                            x: ei.x - ej.x,
                            y: ei.y - ej.y
                        };

                        n_magn = Math.sqrt(Math.pow(nji.x, 2) + Math.pow(nji.y, 2));
                        nji = {
                            x: nji.x / n_magn,
                            y: nji.y / n_magn
                        }


                        var nij = {
                            x: -nji.x,
                            y: -nji.y
                        }

                        console.log("========== Bounce ! ===============");
                        ei.bounce(ej);
                        ej.bounce(ei);
                    }
                }
            }
        }
    };
})();
