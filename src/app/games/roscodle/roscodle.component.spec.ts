import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { AppLifecycleService } from '../../shared/services/app-lifecycle.service';
import { RoscodleComponent } from './roscodle.component';

describe('RoscodleComponent pause flow', () => {
  let component: RoscodleComponent;
  let lifecycleChanges: Subject<boolean>;

  beforeEach(() => {
    lifecycleChanges = new Subject<boolean>();
    TestBed.configureTestingModule({
      providers: [{
        provide: AppLifecycleService,
        useValue: { stateChanges: lifecycleChanges.asObservable() },
      }],
    });
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date('2026-09-25T12:00:00Z'));
    component = TestBed.runInInjectionContext(() => new RoscodleComponent());
    component.ngOnInit();
  });

  afterEach(() => {
    component.ngOnDestroy();
    jasmine.clock().uninstall();
  });

  it('freezes time, leaves the passed question pending and resumes on the next one', () => {
    component.startGame('players');
    const currentIndex = component.currentIndex;
    const secondsLeft = component.secondsLeft;

    component.pass();
    jasmine.clock().tick(3000);

    expect(component.isPaused).toBeTrue();
    expect(component.letters[currentIndex].status).toBe('pending');
    expect(component.currentIndex).toBe(currentIndex + 1);
    expect(component.secondsLeft).toBe(secondsLeft);

    component.resume();
    jasmine.clock().tick(1000);

    expect(component.isPaused).toBeFalse();
    expect(component.currentIndex).toBe(currentIndex + 1);
    expect(component.current?.status).toBe('current');
    expect(component.secondsLeft).toBe(secondsLeft - 1);
  });

  it('reconciles the real elapsed time after returning from background', () => {
    component.startGame('players');
    jasmine.clock().tick(1000);
    const beforeBackground = component.secondsLeft;

    lifecycleChanges.next(false);
    jasmine.clock().tick(5000);
    expect(component.secondsLeft).toBe(beforeBackground);

    lifecycleChanges.next(true);
    expect(component.secondsLeft).toBe(beforeBackground - 5);
  });
});
