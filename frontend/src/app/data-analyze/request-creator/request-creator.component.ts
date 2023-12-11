import { Component, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Stage } from 'konva/lib/Stage';
import { Group } from 'konva/lib/Group';
import { Layer } from 'konva/lib/Layer';
import { Rect } from 'konva/lib/shapes/Rect';
import { Text } from 'konva/lib/shapes/Text';
import { KonvaEventObject } from 'konva/lib/Node';
import { LocalStorageService } from 'src/app/services/localstorage.service';
import { RequestCreatorConfig } from './RequestCreatorConfig';

export enum RequestNodeType {
  OPERAND,
  OPERATOR,
  ARGUMENT,
  LEFT_ARGUMENT,
  RIGHT_ARGUMENT,
  FUNCTION
}

type RequestNodeInfo = {
  type: RequestNodeType,
  parent: RequestNode | null,
  leftChild: RequestNode | null,
  rightChild: RequestNode | null,
  container: Rect | null,
  leftEmptyArgument: Rect | null,
  rightEmptyArgument: Rect | null,
  label: Text | null
};

type RequestNode = Rect | Group;

@Component({
  selector: 'app-request-creator',
  templateUrl: './request-creator.component.html',
  styleUrls: ['./request-creator.component.scss'],
})
export class RequestCreatorComponent implements OnChanges {
  @Input() newOperands: string[] = [];

  operators: string[] = ['AND', 'OR', 'NOT', 'XOR', 'WITHOUT'];
  generators: Map<string, [number, number]> = new Map();

  private primaryColor: string = '';
  private secondaryColor: string = '';
  private tertiaryColor: string = '';
  private quaternaryColor: string = '';
  private quinaryColor: string = '';
  private textSize: number = 0;
  private textColor: string = '';
  private internalPadding: number = 0;

  private stage: Stage | null = null;
  private backLayer: Layer | null = null;
  private frontLayer: Layer | null = null;
  private currentDragStart: any = undefined;
  private currentDragTarget: any = undefined;
  private queryHandler: RequestNode | undefined;

  constructor(private elem: ElementRef, private localStorage: LocalStorageService) {
    // set config base on current theme
    const theme = this.localStorage.get(LocalStorageService.themeKey);
    const config = RequestCreatorConfig[theme];
    this.primaryColor = config.primaryColor;
    this.secondaryColor = config.secondaryColor;
    this.tertiaryColor = config.tertiaryColor;
    this.quaternaryColor = config.quaternaryColor;
    this.quinaryColor = config.quinaryColor;
    this.textSize = config.textSize;
    this.textColor = config.textColor;
    this.internalPadding = config.internalPadding;
  }

  ngAfterViewInit(): void {
    this.initialize();
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const operand of this.newOperands) {
      this.createOperand(operand, this.secondaryColor);
    }
  }

  initialize(): void {
    const width = this.elem.nativeElement.offsetWidth;
    const height = this.elem.nativeElement.offsetHeight;

    this.stage = new Stage({
      container: 'konva-container',
      width: width,
      height: height
    });

    this.backLayer = new Layer();
    this.frontLayer = new Layer();
    this.stage.add(this.backLayer);
    this.stage.add(this.frontLayer);

    this.stage.draw();

    const operatorGenerators = [];
    var totalWidth = 0;
    for (const operator in this.operators) {
      const node = this.createOperator(this.operators[operator], true);
      operatorGenerators.push(node);
      totalWidth += node.getClientRect().width;
    }

    const space = (width - totalWidth) / (operatorGenerators.length + 1);
    for (var i = 0; i < operatorGenerators.length; i++) {
      const x = space * (i + 1) + totalWidth / operatorGenerators.length * i;
      const y = this.internalPadding;
      operatorGenerators[i].setAttr('x', x);
      operatorGenerators[i].setAttr('y', y);
      this.generators.set(this.operators[i], [x, y]);
    }

    this.queryHandler = this.generateQueryHandler();
    this.queryHandler.setAttr('x', width / 3);
    this.queryHandler.setAttr('y', height / 3);
  }

  getQuery(): object | null {
    if (this.queryHandler === undefined) {
      return null;
    }

    const rightChild = this.queryHandler.getAttr('metadata')?.rightChild;
    if (rightChild === null) {
      return null;
    }

    return this.convertToJson((this.queryHandler!.getAttr('metadata') as RequestNodeInfo).rightChild!);
  }

  private createOperand(operand: string, color: string): RequestNode {
    const operandLabel = this.createText(operand, false);

    const operandLabelWidth = operandLabel.width();
    const operandLabelHeight = operandLabel.height();

    const operandOvalWidth = operandLabelWidth + 2 * this.internalPadding;
    const operandOvalHeight = operandLabelHeight + this.internalPadding;

    const operandOval = this.createOval(operandOvalWidth, operandOvalHeight, color, false);

    operandLabel.setAttr('offsetX', -this.internalPadding);
    operandLabel.setAttr('offsetY', -this.internalPadding / 2);

    const operandGroup = this.createGroup(true);

    operandGroup.add(operandOval);
    operandGroup.add(operandLabel);

    this.backLayer!.add(operandGroup);

    operandGroup.on('dragstart', this.handleDragstart.bind(this));
    operandGroup.on('dragend', this.handleDragend.bind(this));
    operandGroup.on('dragmove', this.handleDragmove.bind(this));

    const nodeInfo: RequestNodeInfo = {
      type: RequestNodeType.OPERAND,
      parent: null,
      leftChild: null,
      rightChild: null,
      container: operandOval,
      leftEmptyArgument: null,
      rightEmptyArgument: null,
      label: operandLabel
    };
    operandGroup.setAttr('metadata', nodeInfo);

    return operandGroup;
  }

  private createArgument(color: string): Rect {
    const argumentLabel = this.createText('   ', false);

    const operandLabelWidth = argumentLabel.width();
    const operandLabelHeight = argumentLabel.height();

    const operandOvalWidth = operandLabelWidth + 2 * this.internalPadding;
    const operandOvalHeight = operandLabelHeight + this.internalPadding;

    const operandOval = this.createOval(operandOvalWidth, operandOvalHeight, color, false);

    this.backLayer!.add(operandOval);

    operandOval.on('dragenter', this.handleDragenter.bind(this));
    operandOval.on('dragleave', this.handleDragleave.bind(this));
    operandOval.on('drop', this.handleDrop.bind(this));

    const nodeInfo: RequestNodeInfo = {
      type: RequestNodeType.ARGUMENT,
      parent: null,
      leftChild: null,
      rightChild: null,
      container: operandOval,
      leftEmptyArgument: null,
      rightEmptyArgument: null,
      label: argumentLabel
    };
    operandOval.setAttr('metadata', nodeInfo);

    return operandOval;
  }

  private createOperator(operator: string, isGenerator: boolean): RequestNode {
    const leftArgument = this.createArgument(this.tertiaryColor);
    const rightArgument = this.createArgument(this.tertiaryColor);

    leftArgument.setAttr('x', 0);
    leftArgument.setAttr('y', 0);

    rightArgument.setAttr('x', 0);
    rightArgument.setAttr('y', 0);

    const operatorLabel = this.createText(operator, false);
    const operatorOval = this.createOval(0, 0, this.primaryColor, false);
    const operatorGroup = this.createGroup(true);

    operatorGroup.add(operatorOval);
    operatorGroup.add(leftArgument);
    operatorGroup.add(rightArgument);
    operatorGroup.add(operatorLabel);

    (leftArgument.getAttr('metadata') as RequestNodeInfo).type = RequestNodeType.LEFT_ARGUMENT;
    (rightArgument.getAttr('metadata') as RequestNodeInfo).type = RequestNodeType.RIGHT_ARGUMENT;

    (leftArgument.getAttr('metadata') as RequestNodeInfo).parent = operatorGroup;
    (rightArgument.getAttr('metadata') as RequestNodeInfo).parent = operatorGroup;

    this.backLayer!.add(operatorGroup);

    if (isGenerator) {
      operatorGroup.on('dragstart', this.handleGeneratorDragstart.bind(this));
    }
    else {
      operatorGroup.on('dragstart', this.handleDragstart.bind(this));
    }

    operatorGroup.on('dragend', this.handleDragend.bind(this));
    operatorGroup.on('dragmove', this.handleDragmove.bind(this));
    operatorGroup.on('dblclick', () => { console.log(this.convertToJson(operatorGroup)); });

    const nodeInfo: RequestNodeInfo = {
      type: RequestNodeType.OPERATOR,
      parent: null,
      leftChild: null,
      rightChild: null,
      container: operatorOval,
      leftEmptyArgument: leftArgument,
      rightEmptyArgument: rightArgument,
      label: operatorLabel
    };
    operatorGroup.setAttr('metadata', nodeInfo);

    this.redrawOperatorNode(operatorGroup);

    return operatorGroup;
  }

  private generateQueryHandler(): RequestNode {
    const argument = this.createArgument(this.tertiaryColor);

    argument.setAttr('x', 0);
    argument.setAttr('y', 0);

    const funLabel = this.createText('QUERY', false);
    const funRectangle = this.createRectangle(0, 0, this.quinaryColor, false);
    const funGroup = this.createGroup(true);

    funGroup.add(funRectangle);
    funGroup.add(argument);
    funGroup.add(funLabel);

    (argument.getAttr('metadata') as RequestNodeInfo).type = RequestNodeType.RIGHT_ARGUMENT;
    (argument.getAttr('metadata') as RequestNodeInfo).parent = funGroup;

    this.backLayer!.add(funGroup);

    const nodeInfo: RequestNodeInfo = {
      type: RequestNodeType.FUNCTION,
      parent: null,
      leftChild: null,
      rightChild: null,
      container: funRectangle,
      leftEmptyArgument: null,
      rightEmptyArgument: argument,
      label: funLabel
    };
    funGroup.setAttr('metadata', nodeInfo);

    this.redrawOperatorNode(funGroup);

    return funGroup;
  }

  private redrawOperatorNode(node: Group): void {
    const nodeInfo = node.getAttr('metadata') as RequestNodeInfo;

    if (nodeInfo.type === RequestNodeType.FUNCTION) {
      const argument: RequestNode = nodeInfo.rightChild !== null ? nodeInfo.rightChild : nodeInfo.rightEmptyArgument!;
      const argumentWidth = argument.getClientRect().width;
      const argumentHeight = argument.getClientRect().height;
      const funLabelWidth = nodeInfo.label!.width();
      const funLabelHeight = nodeInfo.label!.height();
      const funRectangleWidth = argumentWidth + funLabelWidth + 4 * this.internalPadding;
      const funRectangleHeight = Math.max(argumentHeight, funLabelHeight) + this.internalPadding;

      nodeInfo.container!.setAttr('width', funRectangleWidth);
      nodeInfo.container!.setAttr('height', funRectangleHeight);
      nodeInfo.container!.setAttr('cornerRadius', funRectangleHeight / 4);

      nodeInfo.label!.setAttr('offsetX', -(2 * this.internalPadding));
      nodeInfo.label!.setAttr('offsetY', -(funRectangleHeight - funLabelHeight) / 2);

      argument.setAttr('x', 0);
      argument.setAttr('y', 0);
      argument.setAttr('offsetX', -(funRectangleWidth - this.internalPadding - argumentWidth));
      argument.setAttr('offsetY', -(funRectangleHeight - argumentHeight) / 2);
    }
    else {
      const leftArgument: RequestNode = nodeInfo.leftChild !== null ? nodeInfo.leftChild : nodeInfo.leftEmptyArgument!;
      const rightArgument: RequestNode = nodeInfo.rightChild !== null ? nodeInfo.rightChild : nodeInfo.rightEmptyArgument!;

      const leftArgumentWidth = leftArgument.getClientRect().width;
      const leftArgumentHeight = leftArgument.getClientRect().height;

      const rightArgumentWidth = rightArgument.getClientRect().width;
      const rightArgumentHeight = rightArgument.getClientRect().height;

      const operatorLabelWidth = nodeInfo.label!.width();
      const operatorLabelHeight = nodeInfo.label!.height();

      const operatorOvalWidth = operatorLabelWidth + leftArgumentWidth + rightArgumentWidth + 4 * this.internalPadding;
      const operatorOvalHeight = Math.max(operatorLabelHeight, leftArgumentHeight, rightArgumentHeight) + this.internalPadding;

      nodeInfo.container!.setAttr('width', operatorOvalWidth);
      nodeInfo.container!.setAttr('height', operatorOvalHeight);
      nodeInfo.container!.setAttr('cornerRadius', operatorOvalHeight / 2);

      nodeInfo.label!.setAttr('offsetX', -(2 * this.internalPadding + leftArgumentWidth));
      nodeInfo.label!.setAttr('offsetY', -(operatorOvalHeight - operatorLabelHeight) / 2);

      leftArgument.setAttr('x', 0);
      leftArgument.setAttr('y', 0);
      leftArgument.setAttr('offsetX', -this.internalPadding);
      leftArgument.setAttr('offsetY', -(operatorOvalHeight - leftArgumentHeight) / 2);

      rightArgument.setAttr('x', 0);
      rightArgument.setAttr('y', 0);
      rightArgument.setAttr('offsetX', -(operatorOvalWidth - this.internalPadding - rightArgumentWidth));
      rightArgument.setAttr('offsetY', -(operatorOvalHeight - rightArgumentHeight) / 2);

      const nodeParent = (node.getAttr('metadata') as RequestNodeInfo).parent;
      if (nodeParent !== null) {
        this.redrawOperatorNode(nodeParent as Group);
      }
    }
  }

  private createOval(width: number, height: number, fillColor: string, draggable: boolean): Rect {
    return new Rect({
      x: 0,
      y: 0,
      width: width,
      height: height,
      cornerRadius: height / 2,
      fill: fillColor,
      strokeWidth: 0.1,
      stroke: "black",
      draggable: draggable
    });
  }

  private createRectangle(width: number, height: number, fillColor: string, draggable: boolean): Rect {
    return new Rect({
      x: 0,
      y: 0,
      width: width,
      height: height,
      cornerRadius: height / 4,
      fill: fillColor,
      strokeWidth: 0.1,
      stroke: "black",
      draggable: draggable
    });
  }

  private createText(text: string, draggable: boolean): Text {
    return new Text({
      x: 0,
      y: 0,
      text: text,
      fontSize: this.textSize,
      fill: this.textColor,
      draggable: draggable
    });
  }

  private createGroup(draggable: boolean): Group {
    const rand1 = 0.7 + Math.random() * 0.6;
    const rand2 = 0.7 + Math.random() * 0.6;
    return new Group({
      x: this.stage!.width() / 2 * rand1,
      y: this.stage!.height() / 2 * rand2,
      draggable: draggable,
    });
  }

  private handleDragstart(e: KonvaEventObject<DragEvent>): void {
    e.target.moveTo(this.frontLayer);
    this.currentDragStart = e.target;
  }

  private handleGeneratorDragstart(e: KonvaEventObject<DragEvent>): void {
    const operator = e.target;
    const operatorText = operator.getAttr('metadata')?.label?.text();
    const operatorCopy = this.createOperator(operatorText, true);
    const operatorCopyCoords = this.generators.get(operatorText) as [number, number];
    operatorCopy.setAttr('x', operatorCopyCoords[0]);
    operatorCopy.setAttr('y', operatorCopyCoords[1]);

    operator.on('dragstart', this.handleDragstart.bind(this));

    e.target.moveTo(this.frontLayer);
    this.currentDragStart = e.target;
  }

  private handleDragend(e: KonvaEventObject<DragEvent>): void {
    var pointerPosition = this.stage!.getPointerPosition();
    if (pointerPosition) {
      var shape = this.backLayer!.getIntersection(pointerPosition);
      if (shape && shape instanceof Rect && shape.getAttr('metadata') && [RequestNodeType.LEFT_ARGUMENT, RequestNodeType.RIGHT_ARGUMENT].includes((shape.getAttr('metadata') as RequestNodeInfo).type)) {
        this.currentDragTarget.fire('drop', { evt: e.evt }, true);
      }
      else {
        setTimeout(() => {
          this.detachChild(this.currentDragStart);
        }, 50); // this delay necessary, because drageventhandlers are async
      }
      this.currentDragTarget = undefined;

      e.target.moveTo(this.backLayer);
    }
  }

  private handleDragenter(e: KonvaEventObject<DragEvent>): void {
    (e.target as any).fill(this.quaternaryColor);
  }

  private handleDragleave(e: KonvaEventObject<DragEvent>): void {
    (e.target as any).fill(this.tertiaryColor);
  }

  private handleDrop(e: KonvaEventObject<DragEvent>): void {
    (e.target as any).fill(this.tertiaryColor);
    setTimeout(() => {
      this.detachChild(this.currentDragStart);
      this.attachChild(e.target as RequestNode, this.currentDragStart);
    }, 50); // this delay necessary, because drageventhandlers are async
  }

  private handleDragmove(evt: KonvaEventObject<any>): void {
    var pointerPosition = this.stage!.getPointerPosition();
    if (pointerPosition) {
      var shape = this.backLayer!.getIntersection(pointerPosition);
      if (this.currentDragTarget && shape) {
        if (this.currentDragTarget !== shape) {
          this.currentDragTarget.fire('dragleave', { evt: evt.evt }, true);
          shape.fire('dragenter', { evt: evt.evt }, true);
          this.currentDragTarget = shape;
        }
        else {
          this.currentDragTarget.fire('dragover', { evt: evt.evt }, true);
        }
      }
      else if (!this.currentDragTarget && shape) {
        this.currentDragTarget = shape;
        shape.fire('dragenter', { evt: evt.evt }, true);
      }
      else if (this.currentDragTarget && !shape) {
        this.currentDragTarget.fire('dragleave', { evt: evt.evt }, true);
        this.currentDragTarget = undefined;
      }
    }
  }

  private attachChild(emptyArgument: RequestNode, childToAttach: Group): void {
    const emptyArgumentInfo = emptyArgument.getAttr('metadata') as RequestNodeInfo;
    const emptyArgumentParentInfo = emptyArgumentInfo.parent!.getAttr('metadata') as RequestNodeInfo;

    childToAttach.moveTo(emptyArgumentInfo.parent!);
    (childToAttach.getAttr('metadata') as RequestNodeInfo).parent = emptyArgumentInfo.parent!;

    if (emptyArgumentInfo.type == RequestNodeType.LEFT_ARGUMENT) {
      emptyArgumentParentInfo.leftEmptyArgument!.visible(false);
      emptyArgumentParentInfo.leftChild = childToAttach;
    }
    else {
      emptyArgumentParentInfo.rightEmptyArgument!.visible(false);
      emptyArgumentParentInfo.rightChild = childToAttach;
    }

    this.redrawOperatorNode(emptyArgumentInfo.parent! as Group);
  }

  private detachChild(childToDetach: Group): void {
    const childInfo = childToDetach.getAttr('metadata') as RequestNodeInfo;
    if (childInfo.parent !== null) {
      const childParentInfo = childInfo.parent.getAttr('metadata') as RequestNodeInfo;
      if (childParentInfo.leftChild === childToDetach) {
        childParentInfo.leftChild = null;
        childParentInfo.leftEmptyArgument!.visible(true);
      }
      else {
        childParentInfo.rightChild = null;
        childParentInfo.rightEmptyArgument!.visible(true);
      }

      this.redrawOperatorNode(childInfo.parent! as Group);
    }

    childInfo.parent = null;
  }

  private convertToJson(node: RequestNode): object {
    const nodeInfo = node.getAttr('metadata') as RequestNodeInfo;

    const left = nodeInfo.leftChild === null ? null : this.convertToJson(nodeInfo.leftChild);
    const right = nodeInfo.rightChild === null ? null : this.convertToJson(nodeInfo.rightChild);
    const value = nodeInfo.label?.text();

    return {
      left: left,
      right: right,
      value: value,
      type: nodeInfo.type
    };
  }
}
