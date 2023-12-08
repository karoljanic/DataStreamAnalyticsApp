from sympy.logic.boolalg import to_dnf
from sympy.core.symbol import Symbol

def make_small_table(expr):
    if expr.func is Symbol:
        return { "pos": [int(str(expr))] }
    
    if str(expr.func) == "Not":
        return { "neg": [int(str(expr.args[0]))]}

    table = { "pos": [], "neg": []}

    for arg in expr.args:
        if arg.func is Symbol:
            table["pos"].append(int(str(arg)))
        elif str(arg.func) == "Not":
            table["neg"].append(int(str(arg.args[0])))
    return table

# Tabela reprezentująca zapytanie w postaci DNF
# Przykład: dla (1 & ~2) | (3 & 4) | (~5 & ~6) zwrócimy
# [{"pos": [1], "neg": [2]}, {"pos": [3,4], "neg": []}, {"pos": [], "neg": [5,6]}]
def make_full_table_from_dnf(expr):
    if str(expr.func) == "Not" or str(expr.func) == "And" or expr.func is Symbol:
        return [make_small_table(expr)]
    
    table = []
    for arg in expr.args:
        table.append(make_small_table(arg))

    return table

# Tree jest postaci
# Tree = { left: Tree | None, right: Tree | None, value: Str }
def make_expr_from_tree(tree):
    if not (tree.get('left') or tree.get('right')):
        return Symbol(tree['value'])
    elif tree['value'] == 'AND':
        return  make_expr_from_tree(tree['left']) &  make_expr_from_tree(tree['right'])
    elif tree['value'] == 'OR':
        return  make_expr_from_tree(tree['left']) |  make_expr_from_tree(tree['right'])
    elif tree['value'] == 'NOT':
        return ~make_expr_from_tree(tree['left'])
    elif tree['value'] == 'XOR':
        return  make_expr_from_tree(tree['left']) ^  make_expr_from_tree(tree['right'])
    elif tree['value'] == 'SUB':
        return  make_expr_from_tree(tree['left']) & (~make_expr_from_tree(tree['right']))
    else:
        raise ValueError("Invalid operator: " + tree['value'])

def tree_to_table(tree):
    expr = make_expr_from_tree(tree)
    dnf = to_dnf(expr, simplify=True, force=True)
    table = make_full_table_from_dnf(dnf)
    return table

# Test

# import json

# t = json.loads('{ "left" : { "value" : "2" }, "right" : { "left" : { "value" : "1" }, "value" : "NOT" }, "value" : "AND" }')

# print(t)

# print(tree_to_table(t))
