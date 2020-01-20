import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TowingPage } from './towing.page';

describe('TowingPage', () => {
  let component: TowingPage;
  let fixture: ComponentFixture<TowingPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TowingPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TowingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
