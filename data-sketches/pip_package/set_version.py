new_value = ''

with open('VERSION.txt') as f:
    first_line = f.readline().strip('\n')
    lastChar = first_line[-1]
    new_version = first_line[:-1] +  str( int(lastChar) + 1)
    new_value = new_version

def update_file_with_variable(file_path, new_value):
    with open(file_path, 'w') as file:
        file.write(new_value)

# Example usage
file_to_update = 'VERSION.txt'

update_file_with_variable(file_to_update, new_value)


def change_variable(file_path, variable_name, new_value):
    with open(file_path, 'r') as file:
        lines = file.readlines()

    for i, line in enumerate(lines):
        if variable_name in line:
            # Assuming the variable is assigned using the '=' operator
            parts = line.split('=')
            if len(parts) == 2:
                # Modify the value
                lines[i] = f"{variable_name} = '{new_value}'\n"
                break

    with open(file_path, 'w') as file:
        file.writelines(lines)

# Example usage
file_to_modify = 'setup.py'
variable_to_change = 'VERSION'

change_variable(file_to_modify, variable_to_change, new_value)


