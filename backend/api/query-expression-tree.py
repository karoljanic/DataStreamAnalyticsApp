from sympy.logic.boolalg import to_dnf
from sympy.core.symbol import Symbol

class QueryExpressionTree:
    def __init__(self, 
                left = None,
                right = None, 
                value = None):
        
        self.left: QueryExpressionTree = left
        self.right: QueryExpressionTree = right
        self.value: str = value

    def get_dnf_form(self) -> object:
        sympy_expression = self.get_sympy_expression()
        dnf = to_dnf(sympy_expression, simplify=True, force=True)
        return dnf
    
    def get_sympy_expression(self) -> object:
        if self.left == "NULL" and self.right == "NULL":
            return Symbol(self.value)
        elif self.value == 'AND':
            return self.left.to_expr() & self.right.to_expr()
        elif self.value == 'OR':
            return self.left.to_expr() | self.right.to_expr()
        elif self.value == 'NOT':
            return ~self.left.to_expr()
        elif self.value == 'XOR':
            return self.left.to_expr() ^ self.right.to_expr()
        elif self.value == 'SUB':
            return self.left.to_expr() & (~self.right.to_expr())
        else:
            raise ValueError("Invalid operator: " + self.value)
