var ax = new AX({parent:'body'})
var main = ax.LoadFrom('main.ax')

var example = `Main:[
    content: Hello World
    style:[
        color: red
        position:absolute
        left:50%
        transform:translate(-50%)
    ]
    nested:[
        testelement:[
            content: Hello World %replace%
            quantity:5
            style:[
                display:block
                font-size:2vh
            ]
            children:function(k,v){
                v.replace(k+1)
            };
            onclick:function(){
                alert("Hello world 2 was clicked")
            };
        ]
    ]
]`
