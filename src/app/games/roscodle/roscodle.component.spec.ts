import { TestBed } from '@angular/core/testing';
import { RoscodleComponent } from './roscodle.component';

describe('RoscodleComponent pause flow', () => {
  let component: RoscodleComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    component = TestBed.runInInjectionContext(() => new RoscodleComponent());
    jasmine.clock().install();
  });

  afterEach(() => {
    component.ngOnDestroy();
    jasmine.clock().uninstall();
  });

  it('freezes time and keeps the same question until the player resumes', () => {
    component.startGame('players');
    const currentIndex = component.currentIndex;
    const secondsLeft = component.secondsLeft;

    component.pass();
    jasmine.clock().tick(3000);

    expect(component.isPaused).toBeTrue();
    expect(component.currentIndex).toBe(currentIndex);
    expect(component.secondsLeft).toBe(secondsLeft);

    component.resume();
    jasmine.clock().tick(1000);

    expect(component.isPaused).toBeFalse();
    expect(component.currentIndex).toBe(currentIndex);
    expect(component.secondsLeft).toBe(secondsLeft - 1);
  });
});
