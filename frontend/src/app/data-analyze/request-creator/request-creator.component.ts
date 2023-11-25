import { AfterViewInit, Component } from '@angular/core';
import { Stage } from 'konva/lib/Stage';
import { Group } from 'konva/lib/Group';
import { Layer } from 'konva/lib/Layer';
import { Rect } from 'konva/lib/shapes/Rect';
import { Text } from 'konva/lib/shapes/Text';
import { IRect } from 'konva/lib/types';
import { KonvaEventObject } from 'konva/lib/Node';

enum RequestNodeType {
  OPERAND,
  OPERATOR,
  ARGUMENT,
  LEFT_ARGUMENT,
  RIGHT_ARGUMENT
}

type RequestNodeInfo = {
  type: RequestNodeType,
  leftChild: RequestNode | null
  rightChild: RequestNode | null
  parentId: number | null
};

type RequestNode = Group | Rect;

@Component({
  selector: 'app-request-creator',
  templateUrl: './request-creator.component.html',
  styleUrls: ['./request-creator.component.scss'],
})
export class RequestCreatorComponent implements AfterViewInit {
  private operands: string[] = [];
  private operators: string[] = [];
  private primaryColor: string = '';
  private secondaryColor: string = '';
  private tertiaryColor: string = '';
  private quaternaryColor: string = '';
  private textFont: string = '';
  private textSize: number = 0;
  private textColor: string = '';
  private internalPadding: number = 0;
  private stage: Stage | null = null;
  private backLayer: Layer | null = null;
  private frontLayer: Layer | null = null;
  private currentDragStart: any = undefined;
  private currentDragTarget: any = undefined;

  private nodes: RequestNode[] = [];

  ngAfterViewInit(): void {
    this.initializeRequestCreator(1000, 500, 'konva-container', ['teal', 'aqua', 'white', '#dcdcdc'], 'verdana', 20, 'black', 10, ['a', 'def', '123', 'xyzyx'], ['$', '&&', 'modulo']);

    for (const operand of this.operands) {
      this.createOperand(operand, this.secondaryColor);
    }

    for (const operator of this.operators) {
      this.createOperator(operator);
    }
  }

  initializeRequestCreator(areaWidth: number, areaHeight: number, containerId: string,
    colors: string[], textFont: string, textSize: number, textColor: string,
    internalPadding: number, operands: string[], operators: string[]): void {

    this.primaryColor = colors[0];
    this.secondaryColor = colors[1];
    this.tertiaryColor = colors[2];
    this.quaternaryColor = colors[3];
    this.textFont = textFont;
    this.textSize = textSize;
    this.textColor = textColor;
    this.internalPadding = internalPadding;
    this.operands = operands;
    this.operators = operators;

    this.stage = new Stage({
      container: containerId,
      width: areaWidth,
      height: areaHeight
    });

    this.backLayer = new Layer();
    this.frontLayer = new Layer();
    this.stage.add(this.backLayer);
    this.stage.add(this.frontLayer);

    this.stage.draw();
  }

  private createOperand(operand: string, color: string): RequestNode {
    const operandLabel = this.createText(operand);

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

    operandGroup.setAttr('metadata', { type: RequestNodeType.OPERAND, leftChild: null, rightChild: null, parentId: null });
    this.setupDragAndDropHandlers(operandGroup);

    this.nodes.push(operandGroup);

    return operandGroup;
  }

  private createArgument(color: string): RequestNode {
    const operandLabel = this.createText('   ');

    const operandLabelWidth = operandLabel.width();
    const operandLabelHeight = operandLabel.height();

    const operandOvalWidth = operandLabelWidth + 2 * this.internalPadding;
    const operandOvalHeight = operandLabelHeight + this.internalPadding;

    const operandOval = this.createOval(operandOvalWidth, operandOvalHeight, color, false);

    this.backLayer!.add(operandOval);

    operandOval.setAttr('metadata', { type: RequestNodeType.ARGUMENT, leftChild: null, rightChild: null, parentId: null });

    this.nodes.push(operandOval);

    return operandOval;
  }

  private createOperator(operator: string, leftArgument: RequestNode | undefined = undefined, rightArgument: RequestNode | undefined = undefined): RequestNode {
    if (leftArgument === undefined) {
      leftArgument = this.createArgument(this.tertiaryColor);
    }

    if (rightArgument === undefined) {
      rightArgument = this.createArgument(this.tertiaryColor);
    }

    leftArgument.remove();
    rightArgument.remove();

    leftArgument.setAttr('x', 0);
    leftArgument.setAttr('y', 0);

    rightArgument.setAttr('x', 0);
    rightArgument.setAttr('y', 0);

    const leftArgumentWidth = leftArgument.getClientRect().width;
    const leftArgumentHeight = leftArgument.getClientRect().height;

    const rightArgumentWidth = rightArgument.getClientRect().width;
    const rightArgumentHeight = rightArgument.getClientRect().height;

    const operatorLabel = this.createText(operator);

    const operatorLabelWidth = operatorLabel.width();
    const operatorLabelHeight = operatorLabel.height();

    const operatorOvalWidth = operatorLabelWidth + leftArgumentWidth + rightArgumentWidth + 4 * this.internalPadding;
    const operatorOvalHeight = Math.max(operatorLabelHeight, leftArgumentHeight, rightArgumentHeight) + this.internalPadding;

    const operatorOval = this.createOval(operatorOvalWidth, operatorOvalHeight, this.primaryColor, false);

    operatorLabel.setAttr('offsetX', -(2 * this.internalPadding + leftArgumentWidth));
    operatorLabel.setAttr('offsetY', -(operatorOvalHeight - operatorLabelHeight) / 2);

    leftArgument.setAttr('offsetX', -this.internalPadding);
    leftArgument.setAttr('offsetY', -(operatorOvalHeight - leftArgumentHeight) / 2);

    rightArgument.setAttr('offsetX', -(operatorOvalWidth - this.internalPadding - rightArgumentWidth));
    rightArgument.setAttr('offsetY', -(operatorOvalHeight - leftArgumentHeight) / 2);

    const operatorGroup = this.createGroup(true);

    operatorGroup.add(operatorOval);
    operatorGroup.add(leftArgument);
    operatorGroup.add(rightArgument);
    operatorGroup.add(operatorLabel);

    this.backLayer!.add(operatorGroup);

    leftArgument.getAttr('metadata').type = RequestNodeType.LEFT_ARGUMENT;
    rightArgument.getAttr('metadata').type = RequestNodeType.RIGHT_ARGUMENT;

    leftArgument.getAttr('metadata').parentId = operatorGroup._id;
    rightArgument.getAttr('metadata').parentId = operatorGroup._id;

    operatorGroup.setAttr('metadata', { type: RequestNodeType.OPERATOR, leftChild: leftArgument, rightChild: rightArgument, parentId: null });
    this.setupDragAndDropHandlers(operatorGroup);

    this.nodes.push(operatorGroup);

    return operatorGroup;
  }

  private createOval(width: number, height: number, fillColor: string, draggable: boolean): Rect {
    return new Rect({
      x: 0,
      y: 0,
      width: width,
      height: height,
      cornerRadius: height / 2,
      fill: fillColor,
      strokeWidth: 0,
      draggable: draggable
    });
  }

  private createText(text: string): Text {
    return new Text({
      x: 0,
      y: 0,
      text: text,
      fontSize: this.textSize,
      fontFamily: this.textFont,
      fill: this.textColor,
      draggable: false
    });
  }

  private createGroup(draggable: boolean): Group {
    return new Group({
      x: this.stage!.width() / 2,
      y: this.stage!.height() / 2,
      draggable: draggable,
    });
  }

  private setupDragAndDropHandlers(node: RequestNode): void {
    node.on('dragstart', this.handleDragstart.bind(this));
    node.on('dragend', this.handleDragend.bind(this));
    node.on('dragenter', this.handleDragenter.bind(this));
    node.on('dragleave', this.handleDragleave.bind(this));
    node.on('dragover', this.handleDragover.bind(this));
    node.on('drop', this.handleDrop.bind(this));
    node.on('dragmove', this.handleDragmove.bind(this));
  }

  private handleDragstart(e: KonvaEventObject<DragEvent>): void {
    e.target.moveTo(this.frontLayer);
    this.currentDragStart = e.target;
  }

  private handleDragend(e: KonvaEventObject<DragEvent>): void {
    var pointerPosition = this.stage!.getPointerPosition();
    if (pointerPosition) {
      var shape = this.backLayer!.getIntersection(pointerPosition);
      if (shape) {
        this.currentDragTarget.fire('drop', { evt: e.evt }, true);
      }
      this.currentDragTarget = undefined;

      e.target.moveTo(this.backLayer);
    }
  }

  private handleDragenter(e: KonvaEventObject<DragEvent>): void {
    if (e.target instanceof Rect && e.target.getAttr('metadata') && [RequestNodeType.LEFT_ARGUMENT, RequestNodeType.RIGHT_ARGUMENT].includes(e.target.getAttr('metadata').type)) {
      (e.target as any).fill(this.quaternaryColor);
    }
  }

  private handleDragleave(e: KonvaEventObject<DragEvent>): void {
    if (e.target instanceof Rect && e.target.getAttr('metadata') && [RequestNodeType.LEFT_ARGUMENT, RequestNodeType.RIGHT_ARGUMENT].includes(e.target.getAttr('metadata').type)) {
      (e.target as any).fill(this.tertiaryColor);
    }
  }

  private handleDragover(e: KonvaEventObject<DragEvent>): void {
    if (e.target instanceof Rect && e.target.getAttr('metadata') && [RequestNodeType.LEFT_ARGUMENT, RequestNodeType.RIGHT_ARGUMENT].includes(e.target.getAttr('metadata').type)) {

    }
  }

  private handleDrop(e: KonvaEventObject<DragEvent>): void {
    if (e.target instanceof Rect && e.target.getAttr('metadata') && [RequestNodeType.LEFT_ARGUMENT, RequestNodeType.RIGHT_ARGUMENT].includes(e.target.getAttr('metadata').type)) {
      (e.target as any).fill(this.tertiaryColor);
      this.mergeRequests(e.target, this.currentDragStart)
    }
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

  private mergeRequests(emptyArgument: RequestNode, childToAppend: RequestNode): void {
    console.log(emptyArgument)
    console.log(childToAppend);
    console.log()

  }

  private getIntersectionObject(currentNode: RequestNode): RequestNode | null {
    const currentNodeBounds = currentNode.getClientRect();
    for (const node of this.nodes) {
      const nodeBounds = node.getClientRect();
      if (currentNode._id != node._id && this.haveIntersection(currentNodeBounds, nodeBounds)) {
        return node;
      }
    }
    return null;
  }

  private haveIntersection(r1: IRect, r2: IRect): boolean {
    return !(r2.x > r1.x + r1.width || r2.x + r2.width < r1.x || r2.y > r1.y + r1.height || r2.y + r2.height < r1.y);
  }
}
