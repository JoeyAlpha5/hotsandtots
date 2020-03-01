import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DriverInTransitPage } from './driver-in-transit.page';

describe('DriverInTransitPage', () => {
  let component: DriverInTransitPage;
  let fixture: ComponentFixture<DriverInTransitPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DriverInTransitPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DriverInTransitPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
