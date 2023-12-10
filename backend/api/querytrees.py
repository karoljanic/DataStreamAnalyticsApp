from sympy.logic.boolalg import to_dnf
from sympy.core.symbol import Symbol

def make_small_table(expr, symbols_dict):
    size = len(symbols_dict)
    table = [0 for _ in range(size)]

    if expr.func is Symbol:
        table[symbols_dict[int(str(expr))]] = 1
    
    if str(expr.func) == "Not":
        table[symbols_dict[int(str(expr.args[0]))]] = -1

    for arg in expr.args:
        if arg.func is Symbol:
            table[symbols_dict[int(str(arg))]] = 1
        elif str(arg.func) == "Not":
            table[symbols_dict[int(str(arg.args[0]))]] = -1
    return table

# Tabela reprezentująca zapytanie w postaci DNF
# Przykład: dla (1 & ~2) | (3 & 4) | (~5 & ~6) zwrócimy
# TODO
def make_full_table_from_dnf(expr, symbols):
    symbols_dict = { x:i for i,x in enumerate(symbols) }

    if str(expr.func) == "Not" or str(expr.func) == "And" or expr.func is Symbol:
        return [make_small_table(expr, symbols_dict)]
    
    table = []
    for arg in expr.args:
        table.append(make_small_table(arg, symbols_dict))

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
    elif tree['value'] == 'WITHOUT':
        return  make_expr_from_tree(tree['left']) & (~make_expr_from_tree(tree['right']))
    else:
        raise ValueError("Invalid operator: " + tree['value'])

def tree_to_table(tree):
    expr = make_expr_from_tree(tree)
    dnf = to_dnf(expr, simplify=True, force=True)
    symbols = sorted(list(map(lambda x: int(str(x)),dnf.free_symbols)))
    table = make_full_table_from_dnf(dnf, symbols)

    symbols_with_table = {"table" : table, "symbols": symbols}
    return symbols_with_table

# Test

# import json
# from sympy import sympify

# t = json.loads('{ "left" : { "value" : "1" }, "right" : { "value" : "2" }, "value" : "AND" }')
# expr = make_expr_from_tree(t)
# print(expr)
# symbols = sorted(list(map(lambda x: int(str(x)),expr.free_symbols)))
# symbols_dict = { x:i for i,x in enumerate(symbols) }
# print(symbols_dict)

# j = tree_to_table(t)

# print(j)