import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { EnclosureComponent } from './enclosure.component';

describe('EnclosureComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [EnclosureComponent],
    providers: [provideRouter([])],
  }));

  it('permite colocar paredes sin superar el presupuesto', () => {
    const component = TestBed.createComponent(EnclosureComponent).componentInstance;
    const grass = component.board.flatMap((row, rowIndex) => row
      .map((tile, columnIndex) => ({ tile, row: rowIndex, column: columnIndex }))
      .filter(({ tile }) => tile === 'grass'));

    grass.slice(0, component.wallBudget + 1).forEach(({ row, column }) => component.toggleWall(row, column));

    expect(component.wallsUsed).toBe(8);
    expect(component.wallsRemaining).toBe(0);
  });

  it('muestra el estado de comprobación y bloquea acciones mientras valida', fakeAsync(() => {
    const fixture = TestBed.createComponent(EnclosureComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const checkButton = fixture.nativeElement.querySelector('.secondary-action') as HTMLButtonElement;

    checkButton.click();
    fixture.detectChanges();

    expect(component.checking).toBeTrue();
    expect(checkButton.disabled).toBeTrue();
    expect(checkButton.textContent).toContain('Comprobando…');
    expect(component.feedback).toContain('Comprobando tu cerramiento');

    tick();
    fixture.detectChanges();

    expect(component.checking).toBeFalse();
    expect(checkButton.textContent).toContain('Comprobar mis paredes');
    expect(component.feedbackTone).toBe('warning');
  }));

  it('calcula y representa la solución óptima del nivel inicial', fakeAsync(() => {
    const component = TestBed.createComponent(EnclosureComponent).componentInstance;

    component.revealOptimal();
    tick();

    expect(component.board).toHaveSize(30);
    expect(component.board[0]).toHaveSize(30);
    expect(component.solution!.enclosedTileCount).toBeGreaterThanOrEqual(5);
    expect(component.solution!.wallsUsed).toBeGreaterThan(0);
    expect(component.solution!.wallsUsed).toBeLessThanOrEqual(8);
    expect(component.wallsUsed).toBe(component.solution!.wallsUsed);
    expect(component.feedbackTone).toBe('success');
  }));

  it('reinicia paredes y presupuesto al cambiar de mapa', () => {
    const component = TestBed.createComponent(EnclosureComponent).componentInstance;
    component.toggleWall(1, 1);

    component.selectLevel(1);

    expect(component.level.name).toBe('Dos horizontes');
    expect(component.board).toHaveSize(30);
    expect(component.wallBudget).toBe(9);
    expect(component.wallsUsed).toBe(0);
  });

  it('genera un mapa distinto sin cambiar la dificultad', () => {
    const component = TestBed.createComponent(EnclosureComponent).componentInstance;
    const previousCode = component.mapCode;

    component.generateNewMap();

    expect(component.mapCode).not.toBe(previousCode);
    expect(component.board).toHaveSize(30);
    expect(component.wallBudget).toBe(8);
  });

  it('mantiene todo el borde transitable y coloca el agua dentro del mapa', () => {
    const component = TestBed.createComponent(EnclosureComponent).componentInstance;
    const last = component.board.length - 1;
    const boundary = [
      ...component.board[0],
      ...component.board[last],
      ...component.board.slice(1, last).flatMap((row) => [row[0], row[last]]),
    ];

    expect(boundary.every((tile) => tile === 'grass')).toBeTrue();
    expect(component.board.slice(1, last).flat().some((tile) => tile === 'water')).toBeTrue();
  });

  it('deja libres las cuatro salidas inmediatas del caballo', () => {
    const component = TestBed.createComponent(EnclosureComponent).componentInstance;
    const horseRow = component.board.findIndex((row) => row.includes('horse'));
    const horseColumn = component.board[horseRow].indexOf('horse');

    expect([
      component.board[horseRow - 1][horseColumn],
      component.board[horseRow + 1][horseColumn],
      component.board[horseRow][horseColumn - 1],
      component.board[horseRow][horseColumn + 1],
    ]).toEqual(['grass', 'grass', 'grass', 'grass']);
  });

  it('mantiene dimensiones y presupuestos fijos en los tres niveles', fakeAsync(() => {
    const component = TestBed.createComponent(EnclosureComponent).componentInstance;
    const expectations = [
      { size: 30, walls: 8 },
      { size: 30, walls: 9 },
      { size: 30, walls: 10 },
    ];

    expectations.forEach(({ size, walls }, index) => {
      if (index > 0) component.selectLevel(index);
      component.revealOptimal();
      tick();

      expect(component.board).withContext(`nivel ${index + 1}`).toHaveSize(size);
      expect(component.board[0]).withContext(`nivel ${index + 1}`).toHaveSize(size);
      expect(component.wallBudget).withContext(`nivel ${index + 1}`).toBe(walls);
      expect(component.solution!.wallsUsed).withContext(`nivel ${index + 1}`).toBeGreaterThan(0);
      expect(component.solution!.wallsUsed).withContext(`nivel ${index + 1}`).toBeLessThanOrEqual(walls);
      expect(component.solution!.enclosedTileCount).withContext(`nivel ${index + 1}`).toBeGreaterThanOrEqual(5);
    });
  }));
});
