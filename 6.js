const
    sizeDelta = 0.5,
    sizeMin = 10,
    sizeMax = 60
    var canvas, ctx, balls, idTimer, mode = 0;
        
const TShape = function(posX, posY) {
    this.radius = sizeMin + Math.random() * (sizeMax - sizeMin); // Диаметр
    this.posX = posX;
    this.posY = posY;
    this.col = RandColor();
    this.vector = mode < 4 ? mode : mode === 4 ? Math.random() * 4 | 0 : 5; // переменной vector присваиваем направление || (для рандомного движения)

    // Обозначение центра фигуры
    this.pointDraw = function() {
        ctx.fillStyle = this.col;   
        ctx.beginPath();            
        this.absPoints.length = 0;  // Очистка absPoints
        this.absPoints.push({x : this.posX + this.points[0].x * this.radius, y : this.posY + this.points[0].y * this.radius}); // Принимаем центр фигуры 
        
        ctx.moveTo(this.absPoints[0].x, this.absPoints[0].y);
        let linesBuf = [];
        linesBuf.push(this.absPoints[0]);
        this.lines.length = 0;
        
        for (var i = 1; i < this.points.length; i++){
            this.absPoints.push({x : this.posX + this.points[i].x * this.radius, y : this.posY + this.points[i].y * this.radius}); // Принимаем углы
            linesBuf.push(this.absPoints[i]);
            if (linesBuf.length >= 2) {
                this.lines.push(linesBuf.slice());
                linesBuf.splice(0, 1);
            }
            
            ctx.lineTo(this.absPoints[i].x, this.absPoints[i].y);
        }
        if (linesBuf.length % 2 === 1) {
            this.lines.push([linesBuf[0], this.absPoints[0]]);
        }
        ctx.closePath();
        ctx.fillStyle = this.col;
        ctx.fill();
    }
}

// Создание фигур -- КРУГ --
const TBall = function(){
    TShape.apply(this, arguments);  // Передача параметров в Функцию выше
    this.draw = function() {        // Функция отрисовки фигуры
        ctx.fillStyle = this.col;   // Заливка
        ctx.beginPath();            // Начало отрисовки
        ctx.arc(this.posX, this.posY, this.radius/2, 0, 2*Math.PI, false); //Отрисовка самой фигуры
        ctx.closePath();            // Конец отрисовки
        ctx.fill();                 // Заполнение пути
    }
}
// Создание фигур -- ТРЕУГОЛЬНИК --
const TTriangle = function() {
    TShape.apply(this, arguments); 
    this.points = [{x:0, y:0.5}, {x:0.5, y:-0.5}, {x:-0.5, y:-0.5}]; // Вершины фигуры
    this.absPoints = [];
    this.lines = [];
    this.draw = this.pointDraw;
}
// Создание фигур -- КВАДРАТ --
const TSquare = function() {
    TShape.apply(this, arguments);
    this.points = [{x:-0.5, y:0.5}, {x:0.5, y:0.5}, {x:0.5, y:-0.5}, {x:-0.5, y:-0.5}];
    this.absPoints = [];
    this.lines = [];
    this.draw = this.pointDraw;
}
// отрисовка
function drawBack(ctx,col1,col2,w,h){
    // закрашиваем канвас градиентным фоном
    ctx.save();
    var g = ctx.createLinearGradient(0,0,0,h);
    g.addColorStop(1,col1);
    g.addColorStop(0,col2);
    ctx.fillStyle = g;
    ctx.fillRect(0,0,w,h);
    ctx.restore();
}

// инициализация работы
function init(){
    canvas = document.getElementById('canvas');
    if (canvas.getContext){
        ctx = canvas.getContext('2d');
        //рисуем фон
        drawBack(ctx,'#202020','#aaa',canvas.width,canvas.height);
        
        // Вывод фигур на канвас
        balls = [];
        for (var i = 1; i<=33;i++){
            var item = new TSquare(10+Math.random()*(canvas.width-30),
            10+Math.random()*(canvas.height-30));
            item.draw(ctx);
            balls.push(item);
        }
        for (var i = 1; i<=33;i++){
            var item = new TTriangle(10+Math.random()*(canvas.width-30),
            10+Math.random()*(canvas.height-30));
            item.draw(ctx);
            balls.push(item);
        }
        for (var i = 1; i<=33;i++){
            var item = new TBall(10+Math.random()*(canvas.width-30),
            10+Math.random()*(canvas.height-30));
            item.draw(ctx);
            balls.push(item);
        }
        var interval
        canvas.addEventListener('mousedown', function(e){
            if (interval) return
                setInterval(goInput(e), 200);
        }, true)
        document.addEventListener('mouseup', function(){
            if (!interval) return
                clearInterval(interval);
            interval = null;
            
        }, true);
        moveBall();
    }
}

    // создаем новый шарик по щелчку мыши, добавляем его в массив шариков и рисуем его
function goInput(e){
    var x = e.clientX;
    var y = e.clientY;
    var item;
    switch (Math.random()*3|0) {
        case 0:
            item = new TSquare(x,y);
            break;
        case 1:
            item = new TTriangle(x,y);
            break;
        case 2:
            item = new TBall(x,y);
            break;
    }
    item.draw(ctx);
    balls.push(item);
}

function moveBall(){
    // Реализацция пересечения
    drawBack(ctx,'#202020','#aaa',canvas.width,canvas.height);
    for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
            let a = balls[i], b = balls[j];
            if (a.constructor.name == 'TBall' && b.constructor.name == 'TBall' ){
                if(Math.pow(a.posX - b.posX, 2) + Math.pow(a.posY - b.posY, 2) < Math.pow(a.radius/2 + b.radius/2, 2)) { // Ball with Ball
                    balls.splice(balls.indexOf(a), 1);
                    balls.splice(balls.indexOf(b), 1);
                }
            }
            else if (a.constructor.name != 'TBall' && b.constructor.name != 'TBall') {
                let good = true;
                for (let i = 0; i < a.lines.length; i++) {
                    let l1 = a.lines[i];
                    for (let j = 0; j < b.lines.length; j++) {
                        let l2 = b.lines[j];
                        good = !SegmentSegment(l1[0].x, l1[0].y, l1[1].x, l1[1].y,  l2[0].x, l2[0].y, l2[1].x, l2[1].y); // Triangle || Square
                        if (!good) 
                            break;
                        
                    }
                    if (!good) 
                        break;
                }
                if (!good){
                    balls.splice(balls.indexOf(a), 1);
                    balls.splice(balls.indexOf(b), 1);
                }
            }

            else{
                if (a.constructor.name == 'TBall' && b.constructor.name != 'TBall'){
                    a = balls[j], b = balls[i];
                }
                let good = true;
                for (let i = 0; i < a.lines.length; i++) {
                    if (SegmentCircle(a.lines[i][0].x, a.lines[i][0].y, a.lines[i][1].x, a.lines[i][1].y, b.posX, b.posY,b.radius / 2)) { // Ball with Triangle || Square
                        good = false;
                        break;
                    }
                }
                if (!good) {
                    balls.splice(balls.indexOf(a), 1);
                    balls.splice(balls.indexOf(b), 1);
                }
            }
                            
        }
    }


    for (let i = 0; i < balls.length;i){
        let ball = balls[i];
        let vel_1 = Math.random() * 4 - 2,
            vel_2 = Math.random() * 2 - 4;
        switch (ball.vector) {
            case 0:
            ball.posX += vel_1;
            ball.posY += vel_2;
                break;
            case 1:
            ball.posX -= vel_2;
            ball.posY += vel_1;
                break;
            case 2:
            ball.posX += vel_1;
            ball.posY -= vel_2;
                break;
            case 3:
            ball.posX += vel_2;
            ball.posY += vel_1;
                break;
            case 5:
            ball.posX += vel_1;
            ball.posY += vel_1;
                break;
        }
        ball.radius += sizeDelta;
        ball.draw(ctx);
        if (ball.radius > sizeMax || ball.posX > canvas.width || ball.posY > canvas.height || ball.posX < 0 || ball.posY < 0)
            balls.splice(i,1);
        else 
            i++;
    }
}
function move(vector){
    mode = vector;
    for (let i = 0; i < balls.length; i++) {
        balls[i].vector = mode < 4 ? mode : mode === 4 ? Math.random() * 4 | 0 : 5;
    }
    if (idTimer) return
        idTimer = setInterval(moveBall, 50);
}




function SegmentCircle(x1, y1, x2, y2,  xC, yC, R){   
    x1 -= xC;
    y1 -= yC;
    x2 -= xC;
    y2 -= yC;
        
    let dx = x2 - x1;
    let dy = y2 - y1;
    
    //составляем коэффициенты квадратного уравнения на пересечение прямой и окружности.
    //если на отрезке [0..1] есть отрицательные значения, значит отрезок пересекает окружность
    let a = dx * dx + dy * dy; // окружность

    let b = 2 * (x1 * dx + y1 * dy); // расстояние между 2 точками

    let c = x1 * x1 + y1 * y1 - R * R; // 
    
    //а теперь проверяем, есть ли на отрезке [0..1] решения 
    if (-b < 0)
        return (c < 0);
    if (-b < (2.*a))
        return ((4.*a*c - b*b) < 0);
    return (a+b+c < 0);
}

function SegmentSegment(x11, y11, x12, y12,  x21, y21, x22, y22){
    let maxx1 = Math.max(x11, x12), maxy1 = Math.max(y11, y12); // Выбор максимальной точки по х
    let minx1 = Math.min(x11, x12), miny1 = Math.min(y11, y12); // мин. точки
    let maxx2 = Math.max(x21, x22), maxy2 = Math.max(y21, y22); // Выбор максимальной точки по y
    let minx2 = Math.min(x21, x22), miny2 = Math.min(y21, y22); // мин. точки
    if (minx1 > maxx2 || maxx1 < minx2 || miny1 > maxy2 || maxy1 < miny2)
        return false;  // Момент, когда линии имеют одну общую вершину...
        
    let dx1 = x12-x11, dy1 = y12-y11; // Длина проекций первой линии на ось x и y
    let dx2 = x22-x21, dy2 = y22-y21; // Длина проекций второй линии на ось x и y
    let dxx = x11-x21, dyy = y11-y21;
    let mul;
    let div = dy2 * dx1 - dx2 * dy1;
    if (div === 0)
        return false; // Линии параллельны...
    if (div > 0) {
        mul = dx1 * dyy - dy1 * dxx;
        if (mul < 0 || mul > div)
            return false; // Первый отрезок пересекается за своими границами...
        mul = dx2 * dyy - dy2 * dxx;
        if (mul < 0 || mul > div)
            return false // Второй отрезок пересекается за своими границами...
    }
    mul = -(dx1 * dyy - dy1 * dxx);
    if (mul < 0 || mul > -div)
        return false; // Первый отрезок пересекается за своими границами...
    mul = -(dx2*dyy-dy2*dxx);
    if (mul < 0 || mul > -div)
        return false; // Второй отрезок пересекается за своими границами...
    return true;
}
    
    // Рандомим цвет
function RandColor(){
    return 'rgb(' + (Math.random() * 256 | 0) + ',' + (Math.random()* 256|0) + ',' + (Math.random()* 256|0) + ')';
}