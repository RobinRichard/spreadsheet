var values = {};
var formulas = {}
var activeCell = "";

document.getElementById("container").innerHTML = genererateGrid();
addListeners()

function addListeners() {
    var elements = document.getElementsByClassName("gridText");

    for (var i = 0; i < elements.length; i++) {
        elements[i].addEventListener('keyup', assignValue, false);
        elements[i].addEventListener('keypress', evaluate, false);
        elements[i].addEventListener('click', setActiveCell, false);
    }
}

// Generate grid
function genererateGrid(includeValues = false) {
    var content = "<table class='grids'>";
    for (var i = 0; i <= 100; i++) {
        content += "<tr>"
        for (var j = 0; j <= 100; j++) {
            var columnName = getColumnName(j - 1)
            if (i === 0 && j > 0) {
                content += "<th>" + columnName + "</th>";
            }
            else if (j === 0 && i !== 0) {
                content += "<th>" + i + "</th>";
            }
            else if (j === 0 && i === 0) {
                content += "<th></th>";
            }
            else {
                columnName += i
                var value = includeValues && values.hasOwnProperty(columnName) ? values[columnName] : "";
                content += "<td class='cell'><input id='" + columnName + "' type='text' class='gridText' value='" + value + "'  /></td>";
            }

        }
    }
    content += "</table>"
    return content
}

// Return column name for given index
function getColumnName(n) {
    var start = 'A'.charCodeAt(0);
    var end = 'Z'.charCodeAt(0);
    var len = end - start + 1;
    var s = "";
    while (n >= 0) {
        s = String.fromCharCode(n % len + start) + s;
        n = Math.floor(n / len) - 1;
    }
    return s;
}
var nextChar = c => c ? String.fromCharCode(c.charCodeAt(0) + 1) : 'A';
var nextCol = s => s.replace(/([^Z]?)(Z*)$/, (_, a, z) => nextChar(a) + z.replace(/Z/g, 'A'));

// Store cell value in the values object
function assignValue(e) {
    var value = e.target.value;
    values[e.target.id] = value;
    reEvaluate()
}

// Evaluate formula in the cell on enter click
function evaluate(e) {
    var value = e.target.value;
    if (e.charCode === 13) {
        if (value.startsWith("=")) {
            value = evaluateExpresssion(value.replace("=", ""))
            formulas[e.target.id] = e.target.value
            e.target.value = value;
            showFormula(e.target.id)
        }
    }
    values[e.target.id] = value;

}

// Reevaluate all formulas on value change in cell
function reEvaluate() {
    Object.keys(formulas).forEach(element => {
        document.getElementById(element).value = evaluateExpresssion(formulas[element].replace("=", ""))
    });

}

// Evaluate the given formula 
// Supported operations : +, -, *, /
// Supported functions : sum, avg, min, max
// Note: all cell addresses and functions are case sencitive
function evaluateExpresssion(expression) {
    var result = "####"
    var methods = ["sum", "avg", "min", "max"]
    var operators = ["+", "-", "*", "/"]

    const isExist = (method) => expression.includes(method);
    if (methods.some(isExist)) {
        var expression_str = expression.split("(")
        var operation = expression_str[0]
        var range = expression_str[1].replace(")", "").split(":")
        var valuesInRange = []
        var range1 = range[0].split(/(\d+)/)
        var range2 = range[1].split(/(\d+)/)
        if (range1[0] === range2[0]) {
            for (var i = Math.min(...[range1[1], range2[1]]); i <= Math.max(...[range1[1], range2[1]]); i++) {
                var key = range1[0] + i
                if (values.hasOwnProperty(key)) {
                    valuesInRange.push(Number(values[key]))
                }
            }

        }
        else if (range1[1] == range2[1]) {
            var initialRange = range1[1];
            while (initialRange !== nextChar(range2[0])) {
                var key = initialRange + range1[1]
                if (values.hasOwnProperty(key)) {
                    valuesInRange.push(Number(values[key]))
                }
                initialRange = nextChar(initialRange)
            }
        }
        switch (operation) {
            case "sum":
                result = valuesInRange.reduce((a, b) => a + b, 0)
                break;
            case "avg":
                result = valuesInRange.reduce((a, b) => a + b, 0) / valuesInRange.length
                break;
            case "min":
                result = Math.min(...valuesInRange)
                break;
            case "max":
                result = Math.max(...valuesInRange)
                break;
            default:
                result = result;
        }

    }
    else {

        var express = []
        operators.forEach(function (operator) {
            var operands = expression.split(operator);
            for (var i = 0; i < operands.length; i++) {
                if (!isNaN(operands[i])) {
                    if (express.length > 0) {
                        express.push(operator)
                    }
                    express.push(Numberoperands[i])
                }
                else if (values.hasOwnProperty(operands[i])) {
                    if (express.length > 0) {
                        express.push(operator)
                    }
                    express.push(values[operands[i]])
                }
            }
        });
        if (express.length > 0) {
            result = eval(express.join(""));
        }
    }

    return result

}

// Refresh the grid 
function reSet() {
    document.getElementById("container").innerHTML = genererateGrid(true);
    addListeners()
    activeCell = ""
    formulas = {}
}

// Set current cell as active cell
function setActiveCell(e) {
    var id = e.target.id
    activeCell = id;
    showFormula(id);


}

// Show formula of the cell if available
function showFormula(id) {
    var element = document.getElementById("formula")
    if (formulas.hasOwnProperty(id)) {
        element.innerHTML = " Formula in current cell is " + formulas[id] + " <button id='removeFormula' value='" + id + "'>Remove formula</button>";
        document.getElementById("removeFormula").addEventListener('click', removeFormula, false);
    }
    else {
        element.innerHTML = "";
    }
}

// Remove formula from the cell
function removeFormula(e) {
    delete formulas[e.target.value]
    document.getElementById("formula").innerHTML = ""
}

// Add remove styles for the cells
function setStyle(style) {
    var element = document.getElementById(activeCell);
    if (element === null) {
        return;
    }
    if (element.classList.contains(style)) {
        element.classList.remove(style)
    }
    else {
        element.classList.add(style);
    }
}
