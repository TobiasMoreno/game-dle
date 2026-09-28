import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { AdService } from '../../shared/services/ad.service';
import { PlatformService } from '../../shared/services/platform.service';
import { ThemeService } from '../../shared/services/theme.service';

type SiteInfoPage = 'about' | 'privacy' | 'terms' | 'contact';

@Component({
  selector: 'app-site-info',
  imports: [RouterLink, FooterComponent],
  templateUrl: './site-info.component.html',
  styleUrl: './site-info.component.css',
})
export class SiteInfoComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly theme = inject(ThemeService);
  readonly adService = inject(AdService);
  readonly isNative = inject(PlatformService).isNative;

  readonly page = this.route.snapshot.data['page'] as SiteInfoPage;
  readonly updatedAt = '26 de septiembre de 2026';

  ngOnInit(): void {
    this.theme.setHeaderTheme('default');
    this.theme.setFooterTheme('default');
  }

  showAdPrivacyOptions(): void {
    void this.adService.showPrivacyOptions();
  }
}
