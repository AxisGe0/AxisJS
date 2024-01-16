var ax = new AX({parent:'body'})
var main = ax.LoadFrom('main.ax')

var example = `Main:[
    content: Hello World
    style:[
        color: red
        position: absolute
        left:50%
        transform: translate(-50%)
    ]
    nested:[
        normalelement:[
            content: Normal Element
            style:[
                display: block
                font-size:3vh
            ]
        ]
        quanityelement:[
            content: Hello World %replace%
            quantity:5
            style:[
                display:block
                font-size:2vh
            ]
            onload:function(v){
                v.replace(v.index+1)
            };
            onclick:function(elm){
                alert(\`Hello world \${elm.index+1} was clicked\`)
            };
        ]
    ]
]`
